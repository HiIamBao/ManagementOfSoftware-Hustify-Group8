"use server";

import { db } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';

type FirestoreUser = {
  fullName?: string;
  name?: string;
  photoURL?: string;
  avatar?: string;
  title?: string;
  headline?: string;
};

type FriendshipDoc = {
  userA: string;
  userB: string;
  participants: string[];
  status: 'pending' | 'accepted';
  createdAt?: any;
};

export async function getFriendsList(): Promise<
  Array<{
    userId: string;
    fullName: string;
    avatarUrl: string;
    subtitle: string;
    connectedSince: string;
  }>
> {
  const user = await getCurrentUser();
  if (!user) return [];

  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', user.id)
    .where('status', '==', 'accepted')
    .get();

  const friendIds = snap.docs
    .map((d) => d.data() as FriendshipDoc)
    .map((f) => (f.userA === user.id ? f.userB : f.userA));

  if (friendIds.length === 0) return [];

  const userDocs = await Promise.all(
    friendIds.map((id) => db.collection('users').doc(id).get())
  );

  return userDocs
    .filter((d) => d.exists)
    .map((d) => {
      const u = (d.data() || {}) as FirestoreUser;
      return {
        userId: d.id,
        fullName: u.fullName || u.name || 'Unknown',
        avatarUrl: u.photoURL || u.avatar || '/user-avatar.jpg',
        subtitle: u.title || u.headline || '',
        connectedSince: 'Friends',
      };
    });
}

export async function getIncomingFriendRequests(): Promise<
  Array<{
    requestId: string;
    fromUserId: string;
    fromName: string;
    fromAvatarUrl: string;
    createdAt: string;
  }>
> {
  const user = await getCurrentUser();
  if (!user) return [];

  const snap = await db
    .collection('friendships')
    .where('userB', '==', user.id)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  const rows = snap.docs.map((d) => {
    const data = d.data() as FriendshipDoc;
    return { id: d.id, from: data.userA, createdAt: (data as any).createdAt };
  });

  const fromDocs = await Promise.all(
    rows.map((x) => db.collection('users').doc(x.from).get())
  );

  return rows.map((x, idx) => {
    const u = (fromDocs[idx].data() || {}) as FirestoreUser;
    return {
      requestId: x.id,
      fromUserId: x.from,
      fromName: u.fullName || u.name || 'Unknown',
      fromAvatarUrl: u.photoURL || u.avatar || '/user-avatar.jpg',
      createdAt: x.createdAt?.toDate?.().toLocaleString?.() || 'Just now',
    };
  });
}

export async function sendFriendRequest(toUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };
  if (user.id === toUserId)
    return { success: false, message: 'Cannot friend yourself' };

  const existing = await db
    .collection('friendships')
    .where('participants', 'array-contains', user.id)
    .get();

  const already = existing.docs.find((d) => {
    const data = d.data() as FriendshipDoc;
    return data.participants?.includes(toUserId);
  });

  if (already) return { success: true, message: 'Request already exists' };

  await db.collection('friendships').add({
    userA: user.id,
    userB: toUserId,
    participants: [user.id, toUserId],
    status: 'pending',
    createdAt: new Date(),
  } satisfies FriendshipDoc);

  return { success: true };
}

export async function respondToFriendRequest(
  requestId: string,
  action: 'accept' | 'decline'
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const ref = db.collection('friendships').doc(requestId);
  const doc = await ref.get();
  if (!doc.exists) return { success: false, message: 'Request not found' };

  const data = doc.data() as FriendshipDoc;
  if (data.userB !== user.id)
    return { success: false, message: 'Permission denied' };

  if (action === 'accept') {
    await ref.update({ status: 'accepted', acceptedAt: new Date() });
  } else {
    await ref.delete();
  }

  return { success: true };
}

export async function removeFriend(friendUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', user.id)
    .where('status', '==', 'accepted')
    .get();

  const doc = snap.docs.find((d) => {
    const data = d.data() as FriendshipDoc;
    return data.participants?.includes(friendUserId);
  });

  if (!doc) return { success: false, message: 'Friendship not found' };
  await db.collection('friendships').doc(doc.id).delete();
  return { success: true };
}

export async function getFriendRecommendations(limit = 12): Promise<
  Array<{
    userId: string;
    fullName: string;
    avatarUrl: string;
    mutualFriendsCount: number;
    requested: boolean;
  }>
> {
  const user = await getCurrentUser();
  if (!user) return [];

  const accepted = await db
    .collection('friendships')
    .where('participants', 'array-contains', user.id)
    .where('status', '==', 'accepted')
    .get();

  const myFriends = accepted.docs
    .map((d) => d.data() as FriendshipDoc)
    .map((f) => (f.userA === user.id ? f.userB : f.userA));

  if (myFriends.length === 0) return [];

  const fofSnaps = await Promise.all(
    myFriends.map((fid) =>
      db
        .collection('friendships')
        .where('participants', 'array-contains', fid)
        .where('status', '==', 'accepted')
        .get()
    )
  );

  const counts = new Map<string, number>();
  for (const snap of fofSnaps) {
    for (const doc of snap.docs) {
      const f = doc.data() as FriendshipDoc;
      const participants = f.participants || [f.userA, f.userB];

      // Candidate is the participant that is NOT my friend and NOT me.
      const cand = participants.find((p) => p !== user.id && !myFriends.includes(p));
      if (!cand) continue;
      if (cand === user.id) continue;
      if (myFriends.includes(cand)) continue;

      counts.set(cand, (counts.get(cand) || 0) + 1);
    }
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const docs = await Promise.all(
    top.map(([id]) => db.collection('users').doc(id).get())
  );

  return top.map(([id, mutual], idx) => {
    const u = (docs[idx].data() || {}) as FirestoreUser;
    return {
      userId: id,
      fullName: u.fullName || u.name || 'Unknown',
      avatarUrl: u.photoURL || u.avatar || '/user-avatar.jpg',
      mutualFriendsCount: mutual,
      requested: false,
    };
  });
}


export async function getFriendshipStatusWith(viewedUserId: string): Promise<
  | { state: 'self' }
  | { state: 'friends' }
  | { state: 'requested' }
  | { state: 'incoming'; requestId: string }
  | { state: 'none' }
> {
  const user = await getCurrentUser();
  if (!user) return { state: 'none' };
  if (user.id === viewedUserId) return { state: 'self' };

  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', user.id)
    .get();

  const row = snap.docs.find((d) => {
    const data = d.data() as FriendshipDoc;
    return data.participants?.includes(viewedUserId);
  });

  if (!row) return { state: 'none' };
  const data = row.data() as FriendshipDoc;

  if (data.status === 'accepted') return { state: 'friends' };

  // pending
  if (data.userA === user.id && data.userB === viewedUserId) return { state: 'requested' };
  if (data.userA === viewedUserId && data.userB === user.id)
    return { state: 'incoming', requestId: row.id };

  return { state: 'none' };
}

export async function acceptIncomingFriendRequestFromUser(fromUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const snap = await db
    .collection('friendships')
    .where('userA', '==', fromUserId)
    .where('userB', '==', user.id)
    .where('status', '==', 'pending')
    .get();

  const doc = snap.docs[0];
  if (!doc) return { success: false, message: 'Request not found' };

  await db.collection('friendships').doc(doc.id).update({
    status: 'accepted',
    acceptedAt: new Date(),
  });

  return { success: true };
}

export async function declineIncomingFriendRequestFromUser(fromUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const snap = await db
    .collection('friendships')
    .where('userA', '==', fromUserId)
    .where('userB', '==', user.id)
    .where('status', '==', 'pending')
    .get();

  const doc = snap.docs[0];
  if (!doc) return { success: false, message: 'Request not found' };

  await db.collection('friendships').doc(doc.id).delete();
  return { success: true };
}


export async function getFriendById(friendUserId: string): Promise<
  | {
      userId: string;
      fullName: string;
      avatarUrl: string;
      subtitle: string;
      connectedSince: string;
    }
  | null
> {
  const userDoc = await db.collection('users').doc(friendUserId).get();
  if (!userDoc.exists) return null;
  const u = (userDoc.data() || {}) as FirestoreUser;
  return {
    userId: userDoc.id,
    fullName: u.fullName || u.name || 'Unknown',
    avatarUrl: u.photoURL || u.avatar || '/user-avatar.jpg',
    subtitle: u.title || u.headline || '',
    connectedSince: 'Friends',
  };
}


export async function getFriendsForUser(userId: string): Promise<
  Array<{ userId: string; fullName: string; avatarUrl: string }>
> {
  const current = await getCurrentUser();

  const snap = await db
    .collection('friendships')
    .where('participants', 'array-contains', userId)
    .where('status', '==', 'accepted')
    .get();

  const friendIds = snap.docs
    .map((d) => d.data() as FriendshipDoc)
    .map((f) => (f.userA === userId ? f.userB : f.userA))
    .filter((id) => id && id !== userId);

  // Ensure we never show the currently authenticated user in the list (requirement)
  const filtered = current?.id ? friendIds.filter((id) => id !== current.id) : friendIds;

  if (filtered.length === 0) return [];

  const docs = await Promise.all(filtered.map((id) => db.collection('users').doc(id).get()));

  return docs
    .filter((d) => d.exists)
    .map((d) => {
      const u = (d.data() || {}) as FirestoreUser;
      return {
        userId: d.id,
        fullName: u.fullName || u.name || 'Unknown',
        avatarUrl: u.photoURL || u.avatar || '/user-avatar.jpg',
      };
    });
}
