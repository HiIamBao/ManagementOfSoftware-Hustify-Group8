"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';

import { auth, db } from '@/firebase/client';
import { markNotificationAsRead, markNotificationsAsRead } from '@/lib/actions/notification.action';
import type { Notification } from '@/types';
import { Card } from '@/components/ui/card';

function formatCreatedAt(createdAt: any) {
  if (!createdAt) return '';
  if (typeof createdAt === 'string') return createdAt;
  if (createdAt?.toDate) return createdAt.toDate().toLocaleString();
  try {
    return new Date(createdAt).toLocaleString();
  } catch {
    return '';
  }
}

export default function NoticesClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Keep the page live-updating
  // NOTE: Use client-side filtering as a backward-compatible fallback
  // (some older notifications may be missing `type` or have different createdAt formats).
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

        const socialOnly = data.filter((n) => {
          if (n?.type === 'friend_post' || n?.type === 'friend_reaction') return true;
          // Fallback for legacy docs missing type:
          const msg = (n?.message || '').toLowerCase();
          return msg.includes('created a new post') || msg.includes('liked your post') || msg.includes('commented on your post');
        }) as Notification[];

        setNotifications(socialOnly);
      });
      return () => unsubSnap();
    });

    return () => {
      unsubAuth();
    };
  }, []);

  const unreadIds = useMemo(
    () => notifications.filter((n) => !n.isRead).map((n) => n.id),
    [notifications]
  );

  // Requirement: opening the page marks currently visible notifications as read.
  useEffect(() => {
    if (unreadIds.length === 0) return;
    startTransition(async () => {
      await markNotificationsAsRead(unreadIds);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (n: Notification) => {
    startTransition(async () => {
      if (!n.isRead) {
        await markNotificationAsRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      }
      router.push(n.link);
    });
  };

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-sm text-muted-foreground">No notifications yet.</div>
      ) : (
        notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition ${
              !n.isRead ? 'border-[#BF3131] bg-[#BF3131]/5' : ''
            }`}
            onClick={() => handleClick(n)}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`${!n.isRead ? 'font-semibold' : ''}`}>{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCreatedAt((n as any).createdAt)}
                </div>
              </div>
              {!n.isRead && (
                <div className="text-xs px-2 py-1 rounded-full bg-[#BF3131] text-white">Unread</div>
              )}
            </div>
          </Card>
        ))
      )}

      {isPending && <div className="text-xs text-muted-foreground">Updating…</div>}
    </div>
  );
}

