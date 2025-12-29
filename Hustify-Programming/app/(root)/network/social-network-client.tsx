"use client";

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { FriendsList } from '@/components/network/MyNetwork';
import {
  FriendRecommendations,
  type FriendRecommendation,
} from '@/components/network/FriendRecommendations';
import {
  FriendRequests,
  type IncomingFriendRequest,
} from '@/components/network/FriendRequests';
import {
  getFriendById,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from '@/lib/actions/friends.action';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/firebase/client';
import { createOrGetConversation } from '@/lib/actions/chat.action';


interface Friend {
  userId: string;
  fullName: string;
  avatarUrl: string;
  subtitle: string;
  connectedSince: string;
}

export default function SocialNetworkClient({
  initialFriends,
  initialRecommendations,
  initialIncomingRequests,
}: {
  initialFriends: Friend[];
  initialRecommendations: FriendRecommendation[];
  initialIncomingRequests: IncomingFriendRequest[];
}) {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [recommendations, setRecommendations] = useState<FriendRecommendation[]>(
    initialRecommendations
  );
  const [incoming, setIncoming] = useState<IncomingFriendRequest[]>(
    initialIncomingRequests
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const incomingCount = useMemo(() => incoming.length, [incoming.length]);

  // A4: real-time highlight for incoming requests
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const q = query(
        collection(db, 'friendships'),
        where('userB', '==', user.uid),
        where('status', '==', 'pending')
      );
      const unsubSnap = onSnapshot(q, (snap) => {
        // We only need count for indicator; list can still be server-fetched.
        const pending = snap.docs.length;
        if (pending !== incoming.length) {
          router.refresh();
        }
      });
      return () => unsubSnap();
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFriend = (userId: string) => {
    startTransition(async () => {
      await sendFriendRequest(userId);
      setRecommendations((prev) =>
        prev.map((r) => (r.userId === userId ? { ...r, requested: true } : r))
      );
    });
  };

  const handleAccept = (requestId: string) => {
    startTransition(async () => {
      const req = incoming.find((r) => r.requestId === requestId);
      await respondToFriendRequest(requestId, 'accept');
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));

      // A1: update friends list immediately
      if (req?.fromUserId) {
        const newFriend = await getFriendById(req.fromUserId);
        if (newFriend) {
          setFriends((prev) => {
            if (prev.some((f) => f.userId === newFriend.userId)) return prev;
            return [newFriend, ...prev];
          });
        } else {
          router.refresh();
        }
      } else {
        router.refresh();
      }
    });
  };

  const handleDecline = (requestId: string) => {
    startTransition(async () => {
      await respondToFriendRequest(requestId, 'decline');
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
    });
  };

  const handleFriendAction = (userId: string, action: 'remove' | 'message') => {
    if (action === 'remove') {
      startTransition(async () => {
        await removeFriend(userId);
        setFriends((prev) => prev.filter((f) => f.userId !== userId));
      });
    } else {
      startTransition(async () => {
        const res = await createOrGetConversation(userId);
        if (res.success && res.conversationId) {
          router.push(`/chat/${res.conversationId}`);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">My Network</h1>
        {incomingCount > 0 && (
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </div>

      <Tabs defaultValue="friends">
        <TabsList>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Requests{incomingCount ? ` (${incomingCount})` : ''}
          </TabsTrigger>
          <TabsTrigger value="recommendations">People You May Know</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList friends={friends} onAction={handleFriendAction} />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <FriendRequests
            requests={incoming}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <FriendRecommendations
            recommendations={recommendations}
            onAddFriend={handleAddFriend}
          />
        </TabsContent>
      </Tabs>

      {isPending && (
        <div className="text-sm text-muted-foreground">Updating…</div>
      )}
    </div>
  );
}

