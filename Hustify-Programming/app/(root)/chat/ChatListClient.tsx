"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';

import { auth, db } from '@/firebase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import type { Conversation } from '@/lib/actions/chat.action';

function formatTime(ts?: any) {
  if (!ts) return '';
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }
  if (ts?.toDate) return ts.toDate().toLocaleString();
  return '';
}

export default function ChatListClient({
  initialConversations,
}: {
  initialConversations: Conversation[];
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [userCache, setUserCache] = useState<
    Record<string, { name: string; image: string } | null>
  >({});
  const [me, setMe] = useState<string | null>(null);

  // Track unread counts per conversation
  const unreadCounts = useMemo(() => {
    if (!me) return {};
    const counts: Record<string, number> = {};
    conversations.forEach((conv) => {
      const lastRead = conv.lastReadAt?.[me];
      const lastMessageAt = conv.lastMessageAt;
      // If no lastRead or lastMessage is newer than lastRead, count as unread
      if (!lastRead || (lastMessageAt && lastMessageAt > lastRead)) {
        counts[conv.id] = 1; // Just track 1 per conversation for now
      }
    });
    return counts;
  }, [conversations, me]);

  // Live-update list (Option 1 assumes permissive/dev rules for now)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setMe(user?.uid || null);
      if (!user) {
        setConversations([]);
        return;
      }
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const unsubSnap = onSnapshot(q, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Conversation[];
        setConversations(data);
      });
      return () => unsubSnap();
    });

    return () => unsub();
  }, []);

  // Fetch and cache other participants' profiles to avoid repeated network calls.
  useEffect(() => {
    if (!me) return;

    const otherIds = new Set<string>();
    conversations.forEach((c) => {
      const otherId = c.participants?.find((p) => p && p !== me);
      if (otherId) otherIds.add(otherId);
    });

    const missing = [...otherIds].filter((id) => !(id in userCache));
    if (missing.length === 0) return;

    (async () => {
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const snap = await getDoc(doc(db, 'users', id));
            const u: any = snap.data();
            const name = u?.fullName || u?.name || 'User';
            const image = u?.photoURL || u?.image || u?.avatar || '/user-avatar.jpg';
            return [id, { name, image }] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );

      setUserCache((prev) => {
        const next = { ...prev };
        entries.forEach(([id, val]) => {
          next[id] = val;
        });
        return next;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, me]);

  return (
    <div className="space-y-3">
      {conversations.length === 0 ? (
        <div className="text-sm text-muted-foreground">No conversations yet.</div>
      ) : (
        conversations.map((c) => (
          <Link key={c.id} href={`/chat/${c.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {(() => {
                    const otherId = me ? c.participants?.find((p) => p && p !== me) : undefined;
                    const other = otherId ? userCache[otherId] : undefined;
                    const name = other?.name || 'Loading…';
                    const image = other?.image || '/user-avatar.jpg';

                    return (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={image} alt={name} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                      </Avatar>
                    );
                  })()}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">
                        {(() => {
                          const otherId = me ? c.participants?.find((p) => p && p !== me) : undefined;
                          const other = otherId ? userCache[otherId] : undefined;
                          return other?.name || 'Loading…';
                        })()}
                      </div>
                      {unreadCounts[c.id] ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {c.lastMessageText || 'No messages yet'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(c.lastMessageAt || c.updatedAt)}
                </div>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}

