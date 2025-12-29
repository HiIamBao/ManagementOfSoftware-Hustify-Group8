"use server";

import { db } from "@/firebase/admin";
import type { BlogPost, BlogComment } from "@/types/blog";
import { Timestamp } from 'firebase-admin/firestore';
import { processUrl } from '@/lib/utils';
import {
  notifyAuthorFriendReaction,
  notifyFriendsPostCreated,
} from './social-notifications.action';


// Helper function to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
  if (timestamp instanceof Date) return timestamp.toISOString();
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString();
  return new Date().toISOString();
}

// Helper function to convert post data
function convertPost(doc: any): BlogPost | undefined {
  try {
    const data = doc.data();
    if (!data) return undefined;

    // Convert the main post timestamp
    const timestamp = convertTimestamp(data.timestamp);

    // Convert comment timestamps and ensure proper structure
    const comments = Array.isArray(data.comments) ? data.comments.map((comment: any) => ({
      id: comment.id || '',
      postId: comment.postId || '',
      author: {
        id: comment.author?.id || '',
        name: comment.author?.name || '',
        image: comment.author?.image || ''
      },
      content: comment.content || '',
      timestamp: convertTimestamp(comment.timestamp)
    })) : [];

    // Ensure likes and reposts are arrays
    const likes = Array.isArray(data.likes) ? data.likes : [];
    const reposts = Array.isArray(data.reposts) ? data.reposts : [];

    // Convert original post if it exists
    const originalPost = data.originalPost ? {
      id: data.originalPost.id || '',
      author: {
        id: data.originalPost.author?.id || '',
        name: data.originalPost.author?.name || '',
        image: data.originalPost.author?.image || '',
      },
      content: data.originalPost.content || ''
    } : undefined;

    return {
      id: doc.id,
      author: {
        id: data.author?.id || '',
        name: data.author?.name || '',
        image: data.author?.image || '',
        title: data.author?.title || 'User'
      },
      content: data.content || '',
      timestamp,
      location: data.location || '',
      comments,
      likes,
      reposts,
      url: data.url,
      photo: data.photo,
      originalPost
    };
  } catch (error) {
    console.error('Error converting post:', error);
    return undefined;
  }
}

// Get latest posts
export async function getPosts(limit: number = 20): Promise<BlogPost[]> {
  try {
    const postsSnapshot = await db.collection("posts")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const posts = postsSnapshot.docs
      .map(convertPost)
      .filter((post): post is BlogPost => post !== undefined);

    return posts;
  } catch (error) {
    console.error("Error getting posts:", error);
    throw error;
  }
}

type CreatePostParams = {
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  location: string;
  url?: string;
  photo?: File;
};

// Create a new blog post
export async function createPost(params: CreatePostParams | FormData): Promise<BlogPost> {
  try {
    let postParams: CreatePostParams;

    if (params instanceof FormData) {
      postParams = {
        userId: params.get('userId') as string,
        userName: params.get('userName') as string,
        userImage: params.get('userImage') as string,
        content: params.get('content') as string,
        location: params.get('location') as string,
        url: params.get('url') as string || undefined,
        photo: params.get('photo') as File || undefined
      };
    } else {
      postParams = params;
    }

    const postRef = db.collection("posts").doc();
    const now = Timestamp.now();

    // Create base post data
    const postData = {
      id: postRef.id,
      author: {
        id: postParams.userId,
        name: postParams.userName,
        image: postParams.userImage,
        title: "User"
      },
      content: postParams.content,
      timestamp: now,
      location: postParams.location,
      likes: [] as string[],
      comments: [] as BlogComment[]
    };

    let photoUrl: string | undefined;

    // Handle photo upload if provided
    if (postParams.photo && postParams.photo instanceof File) {
      // Return a placeholder URL since Firebase Storage is disabled
      photoUrl = 'https://placehold.co/600x400?text=Image+Upload+Disabled';
    }

    // Add optional fields if they exist
    const finalPostData = {
      ...postData,
      ...(postParams.url ? { url: processUrl(postParams.url) } : {}),
      ...(photoUrl ? { photo: photoUrl } : {})
    };

    await postRef.set(finalPostData);

    // Social notification: notify accepted friends that a new post was created.
    // This is server-side and works even without Cloud Functions.
    await notifyFriendsPostCreated({ postId: postRef.id, authorId: postParams.userId });

    return {
      ...finalPostData,
      timestamp: now.toDate().toISOString(),
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Get random posts
export async function getRandomPosts(limit: number = 10): Promise<BlogPost[]> {
  try {
    const postsSnapshot = await db.collection("posts").get();
    const posts = postsSnapshot.docs
      .map(convertPost)
      .filter((post): post is BlogPost => post !== undefined);

    // Shuffle posts randomly
    for (let i = posts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posts[i], posts[j]] = [posts[j], posts[i]];
    }

    return posts.slice(0, limit);
  } catch (error) {
    console.error("Error getting random posts:", error);
    throw error;
  }
}

// Like/Unlike a post
export async function toggleLike(postId: string, userId: string): Promise<string[]> {
  try {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const post = postDoc.data() as BlogPost;
    const likes = new Set(post.likes || []);

    const hadLiked = likes.has(userId);

    if (hadLiked) {
      likes.delete(userId);
    } else {
      likes.add(userId);

      // Social notification: if liking someone else's post, notify the author (only if friends).
      const postAuthorId = (post as any)?.authorId || (post as any)?.author?.id;
      if (postAuthorId && postAuthorId !== userId) {
        await notifyAuthorFriendReaction({
          postId,
          postAuthorId,
          reactorId: userId,
          reactionType: 'like',
        });
      }
    }

    const newLikes = Array.from(likes);
    await postRef.update({
      likes: newLikes
    });

    return newLikes;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

// Add a comment
export async function addComment(params: {
  postId: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
}): Promise<{ comment: BlogComment; comments: BlogComment[] }> {
  try {
    const postRef = db.collection("posts").doc(params.postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const now = Timestamp.now();
    const comment: BlogComment = {
      id: db.collection("_").doc().id,
      postId: params.postId,
      author: {
        id: params.userId,
        name: params.userName,
        image: params.userImage
      },
      content: params.content,
      timestamp: now.toDate().toISOString()
    };

    const post = postDoc.data() as BlogPost;
    const existingComments = Array.isArray(post.comments)
      ? post.comments.map(c => ({
          ...c,
          timestamp: convertTimestamp(c.timestamp)
        }))
      : [];
    const newComments = [...existingComments, comment];

    await postRef.update({
      comments: newComments
    });


    // Social notification: comment on someone else's post -> notify the author (only if friends).
    const postAuthorId = (post as any)?.authorId || (post as any)?.author?.id;
    if (postAuthorId && postAuthorId !== params.userId) {
      await notifyAuthorFriendReaction({
        postId: params.postId,
        postAuthorId,
        reactorId: params.userId,
        reactionType: 'comment',
      });
    }


    return {
      comment,
      comments: newComments
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

// Delete a post
export async function deletePost(postId: string, userId: string): Promise<void> {
  try {
    const postRef = db.collection("posts").doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const post = postDoc.data() as BlogPost;
    if (post.author.id !== userId) {
      throw new Error("Unauthorized");
    }

    await postRef.delete();
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// Edit a post
export async function editPost(params: {
  postId: string;
  userId: string;
  content: string;
  url?: string;
}): Promise<void> {
  try {
    const postRef = db.collection("posts").doc(params.postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const post = postDoc.data() as BlogPost;
    if (post.author.id !== params.userId) {
      throw new Error("Unauthorized");
    }

    const updateData: any = {
      content: params.content
    };

    // Only add url if it exists and is not empty
    if (params.url && params.url.trim()) {
      updateData.url = processUrl(params.url);
    } else {
      // If url is empty or undefined, set it to null
      updateData.url = null;
    }

    await postRef.update(updateData);
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
}

// Edit a comment
export async function editComment(params: {
  postId: string;
  commentId: string;
  userId: string;
  content: string;
}): Promise<{ comment: BlogComment; comments: BlogComment[] }> {
  try {
    const postRef = db.collection("posts").doc(params.postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const post = postDoc.data() as BlogPost;
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const commentIndex = comments.findIndex(c => c.id === params.commentId);

    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    if (comments[commentIndex].author.id !== params.userId) {
      throw new Error("Unauthorized");
    }

    // Update the comment
    const updatedComment: BlogComment = {
      ...comments[commentIndex],
      content: params.content
    };

    const updatedComments = [...comments];
    updatedComments[commentIndex] = updatedComment;

    await postRef.update({
      comments: updatedComments
    });

    return {
      comment: updatedComment,
      comments: updatedComments
    };
  } catch (error) {
    console.error("Error editing comment:", error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(params: {
  postId: string;
  commentId: string;
  userId: string;
}): Promise<BlogComment[]> {
  try {
    const postRef = db.collection("posts").doc(params.postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const post = postDoc.data() as BlogPost;
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const commentIndex = comments.findIndex(c => c.id === params.commentId);

    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    if (comments[commentIndex].author.id !== params.userId) {
      throw new Error("Unauthorized");
    }

    // Remove the comment
    const updatedComments = comments.filter(c => c.id !== params.commentId);

    await postRef.update({
      comments: updatedComments
    });

    return updatedComments;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

// Repost a post
export async function repostPost(params: {
  postId: string;
  userId: string;
  userName: string;
  userImage: string;
  content?: string;
}): Promise<BlogPost> {
  try {
    const originalPostRef = db.collection("posts").doc(params.postId);
    const originalPostDoc = await originalPostRef.get();

    if (!originalPostDoc.exists) {
      throw new Error("Original post not found");
    }

    const originalPost = originalPostDoc.data() as BlogPost;
    const now = Timestamp.now();

    // Create new post for repost
    const repostRef = db.collection("posts").doc();
    const repostData = {
      id: repostRef.id,
      author: {
        id: params.userId,
        name: params.userName,
        image: params.userImage,
        title: "User"
      },
      content: params.content || "",
      timestamp: now,
      likes: [] as string[],
      comments: [] as BlogComment[],
      reposts: [] as string[],
      originalPost: {
        id: originalPost.id,
        author: originalPost.author,
        content: originalPost.content
      }
    };

    await repostRef.set(repostData);

    // Update reposts count in original post
    const newReposts = [...(originalPost.reposts || []), params.userId];
    await originalPostRef.update({
      reposts: newReposts
    });

    return {
      ...repostData,
      timestamp: now.toDate().toISOString()
    };
  } catch (error) {
    console.error("Error reposting:", error);
    throw error;
  }
}