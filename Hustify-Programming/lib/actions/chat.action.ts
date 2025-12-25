"use server";

import { db } from '@/firebase/admin';
import { getCurrentUser } from './auth.action';

export type Conversation = {
  id: string;
  participants: string[];
  participantKey: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  updatedAt?: string;
  createdAt?: string;
  // Map of userId -> last read timestamp (ISO string)
  lastReadAt?: Record<string, string>;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt?: string;
};

function participantKeyFor(a: string, b: string) {
  return [a, b].sort().join('_');
}

export async function createOrGetConversation(otherUserId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };
  if (!otherUserId || otherUserId === user.id)
    return { success: false, message: 'Invalid user' };

  const key = participantKeyFor(user.id, otherUserId);

  const existing = await db
    .collection('conversations')
    .where('participantKey', '==', key)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    return { success: true, conversationId: doc.id };
  }

  const ref = db.collection('conversations').doc();
  const now = new Date().toISOString();

  await ref.set({
    participants: [user.id, otherUserId],
    participantKey: key,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, conversationId: ref.id };
}

export async function sendMessage(params: {
  conversationId: string;
  text: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const text = (params.text || '').trim();
  if (!text) return { success: false, message: 'Empty message' };

  const convRef = db.collection('conversations').doc(params.conversationId);
  const convDoc = await convRef.get();
  if (!convDoc.exists) return { success: false, message: 'Conversation not found' };

  const conv: any = convDoc.data();
  if (!conv?.participants?.includes(user.id))
    return { success: false, message: 'Permission denied' };

  const now = new Date().toISOString();
  const msgRef = convRef.collection('messages').doc();

  await msgRef.set({
    conversationId: params.conversationId,
    senderId: user.id,
    text,
    createdAt: now,
  });

  await convRef.update({
    lastMessageText: text,
    lastMessageSenderId: user.id,
    lastMessageAt: now,
    updatedAt: now,
  });

  return { success: true, messageId: msgRef.id };
}

export async function listConversationsForCurrentUser(limit = 30) {
  const user = await getCurrentUser();
  if (!user) return [];

  const snap = await db
    .collection('conversations')
    .where('participants', 'array-contains', user.id)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Conversation[];
}


export async function markConversationRead(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  const convRef = db.collection('conversations').doc(conversationId);
  const convDoc = await convRef.get();
  if (!convDoc.exists) return { success: false, message: 'Conversation not found' };

  const conv: any = convDoc.data();
  if (!conv?.participants?.includes(user.id))
    return { success: false, message: 'Permission denied' };

  await convRef.update({ [`lastReadAt.${user.id}`]: new Date().toISOString() });
  return { success: true };
}