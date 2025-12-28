"use server";

import { db } from '@/firebase/admin';

type FriendshipDoc = {
  userA: string;
  userB: string;
  participants: string[];
  status: 'pending' | 'accepted';
};

async function getUserName(userId: string) {
  const u = await db.collection('users').doc(userId).get();
  const data: any = u.data();
  return data?.fullName || data?.name || 'Someone';
}

async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', userId)
    .where('status', '==', 'accepted')
    .get();

  return snap.docs
    .map((d) => d.data() as FriendshipDoc)
    .map((f) => (f.userA === userId ? f.userB : f.userA));
}

export async function notifyFriendsPostCreated(params: {
  postId: string;
  authorId: string;
}) {
  const { postId, authorId } = params;
  const authorName = await getUserName(authorId);
  const friendIds = await getAcceptedFriendIds(authorId);
  if (friendIds.length === 0) return { success: true, created: 0 };

  const batch = db.batch();
  friendIds.forEach((fid) => {
    const ref = db.collection('notifications').doc();
    batch.set(ref, {
      userId: fid,
      message: `${authorName} created a new post.`,
      link: `/posts/${postId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'friend_post',
      actorId: authorId,
      postId,
    });
  });

  await batch.commit();
  return { success: true, created: friendIds.length };
}

export async function notifyAuthorFriendReaction(params: {
  postId: string;
  postAuthorId: string;
  reactorId: string;
  reactionType: 'like' | 'comment';
}) {
  const { postId, postAuthorId, reactorId, reactionType } = params;

  const friendsOfAuthor = await getAcceptedFriendIds(postAuthorId);
  if (!friendsOfAuthor.includes(reactorId)) return { success: true, created: 0 };

  const reactorName = await getUserName(reactorId);
  const verb = reactionType === 'comment' ? 'commented on' : 'liked';

  await db.collection('notifications').add({
    userId: postAuthorId,
    message: `${reactorName} ${verb} your post.`,
    link: `/posts/${postId}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    type: 'friend_reaction',
    actorId: reactorId,
    postId,
  });

  return { success: true, created: 1 };
}

