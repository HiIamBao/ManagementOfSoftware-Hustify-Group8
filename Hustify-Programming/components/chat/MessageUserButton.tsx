"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createOrGetConversation } from '@/lib/actions/chat.action';

export default function MessageUserButton({
  otherUserId,
  asIcon,
}: {
  otherUserId: string;
  asIcon?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const res = await createOrGetConversation(otherUserId);
      if (res.success && res.conversationId) {
        router.push(`/chat/${res.conversationId}`);
      } else {
        // TODO: show toast error
        console.error(res.message);
      }
    });
  };

  if (asIcon) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isPending}
        aria-label="Message user"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} disabled={isPending} variant="outline">
      <MessageSquare className="h-4 w-4 mr-2" />
      Message
    </Button>
  );
}

