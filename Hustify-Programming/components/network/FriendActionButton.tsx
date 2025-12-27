"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  acceptIncomingFriendRequestFromUser,
  declineIncomingFriendRequestFromUser,
  removeFriend,
  sendFriendRequest,
} from '@/lib/actions/friends.action';

export type FriendUIStatus =
  | { state: 'self' }
  | { state: 'friends' }
  | { state: 'requested' }
  | { state: 'incoming'; requestId: string }
  | { state: 'none' };

export default function FriendActionButton({
  viewedUserId,
  initialStatus,
}: {
  viewedUserId: string;
  initialStatus: FriendUIStatus;
}) {
  const [status, setStatus] = useState<FriendUIStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status.state === 'self') return null;

  if (status.state === 'friends') {
    return (
      <Button
        variant="secondary"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await removeFriend(viewedUserId);
            setStatus({ state: 'none' });
          })
        }
      >
        Remove Friend
      </Button>
    );
  }

  if (status.state === 'requested') {
    return (
      <Button variant="secondary" disabled>
        Request Sent
      </Button>
    );
  }

  if (status.state === 'incoming') {
    return (
      <div className="flex gap-2">
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await acceptIncomingFriendRequestFromUser(viewedUserId);
              setStatus({ state: 'friends' });
            })
          }
        >
          Accept Request
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await declineIncomingFriendRequestFromUser(viewedUserId);
              setStatus({ state: 'none' });
            })
          }
        >
          Decline
        </Button>
      </div>
    );
  }

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await sendFriendRequest(viewedUserId);
          setStatus({ state: 'requested' });
        })
      }
    >
      Add Friend
    </Button>
  );
}

