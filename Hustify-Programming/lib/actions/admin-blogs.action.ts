"use server";

import { db } from "@/firebase/admin";
import { requireAdmin } from "./auth.action";
import type { BlogPost } from "@/types/blog";
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
  if (timestamp instanceof Date) return timestamp.toISOString();
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString();
  return new Date().toISOString();
}

// Helper function to convert post data (reuse from blog.action.ts pattern)
function convertPost(doc: any): BlogPost | undefined {
  try {
    const data = doc.data();
    if (!data) return undefined;

    const timestamp = convertTimestamp(data.timestamp);
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

    const likes = Array.isArray(data.likes) ? data.likes : [];
    const reposts = Array.isArray(data.reposts) ? data.reposts : [];

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

/**
 * Get all blog posts (admin only - with pagination)
 */
export async function getAllBlogPosts(params?: {
  page?: number;
  limit?: number;
  authorId?: string; // Filter by author
}) {
  try {
    await requireAdmin();
    
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    
    // Build query conditionally
    let query: FirebaseFirestore.Query = db.collection("posts");
    
    // Filter by author if provided
    if (params?.authorId) {
      query = query.where("author.id", "==", params.authorId);
    }
    
    const postsSnapshot = await query
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    
    const posts = postsSnapshot.docs
      .map(convertPost)
      .filter((post): post is BlogPost => post !== undefined);
    
    // Get total count for pagination
    let countQuery: FirebaseFirestore.Query = db.collection("posts");
    if (params?.authorId) {
      countQuery = countQuery.where("author.id", "==", params.authorId);
    }
    const totalSnapshot = await countQuery.count().get();
    const total = totalSnapshot.data().count;
    
    return {
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch blog posts",
    };
  }
}

/**
 * Get a single blog post by ID (admin only)
 */
export async function getBlogPostById(postId: string) {
  try {
    await requireAdmin();
    
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return {
        success: false,
        message: "Post not found",
      };
    }
    
    const post = convertPost(postDoc);
    if (!post) {
      return {
        success: false,
        message: "Failed to parse post data",
      };
    }
    
    return {
      success: true,
      post,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch post",
    };
  }
}

/**
 * Delete a blog post (admin can delete any post)
 */
export async function deleteBlogPost(postId: string) {
  try {
    await requireAdmin();
    
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return {
        success: false,
        message: "Post not found",
      };
    }
    
    await db.collection("posts").doc(postId).delete();
    
    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete post",
    };
  }
}

/**
 * Delete a comment from a blog post (admin can delete any comment)
 */
export async function deleteBlogComment(postId: string, commentId: string) {
  try {
    await requireAdmin();
    
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return {
        success: false,
        message: "Post not found",
      };
    }
    
    const post = postDoc.data();
    const comments = Array.isArray(post?.comments) ? post.comments : [];
    const updatedComments = comments.filter((c: any) => c.id !== commentId);
    
    await db.collection("posts").doc(postId).update({
      comments: updatedComments,
    });
    
    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete comment",
    };
  }
}

/**
 * Get blog posts statistics (admin only)
 */
export async function getBlogPostsStats() {
  try {
    await requireAdmin();
    
    const [totalPosts, postsSnapshot] = await Promise.all([
      db.collection("posts").count().get(),
      db.collection("posts").get(),
    ]);
    
    // Count comments and likes from all posts
    let commentCount = 0;
    let likeCount = 0;
    
    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const comments = Array.isArray(data.comments) ? data.comments : [];
      const likes = Array.isArray(data.likes) ? data.likes : [];
      commentCount += comments.length;
      likeCount += likes.length;
    });
    
    return {
      success: true,
      stats: {
        totalPosts: totalPosts.data().count,
        totalComments: commentCount,
        totalLikes: likeCount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch statistics",
    };
  }
}