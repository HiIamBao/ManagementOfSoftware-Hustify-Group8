"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';

import { auth, db } from '@/firebase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { markConversationRead, sendMessage } from '@/lib/actions/chat.action';

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

function formatTime(ts?: any) {
  if (!ts) return '';
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
  }
  if (ts?.toDate) return ts.toDate().toLocaleString();
  return '';
}

export default function ChatRoomClient({
  conversationId,
}: {
  conversationId: string;
}) {
  const [otherUser, setOtherUser] = useState<{ name: string; image: string } | null>(null);
  const [isOtherLoading, setIsOtherLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setMe(user?.uid || null);
    });
    return () => unsub();
  }, []);

  // Load other participant (avatar + name)
  useEffect(() => {
    if (!me || !conversationId) return;

    setIsOtherLoading(true);
    (async () => {
      const convSnap = await getDoc(doc(db, 'conversations', conversationId));
      const conv: any = convSnap.data();
      const participants: string[] = conv?.participants || [];
      const otherId = participants.find((p) => p && p !== me);

      if (!otherId) {
        setOtherUser(null);
        setIsOtherLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, 'users', otherId));
      const u: any = userSnap.data();
      const name = u?.fullName || u?.name || 'User';
      const image = u?.photoURL || u?.image || u?.avatar || '/user-avatar.jpg';
      setOtherUser({ name, image });
      setIsOtherLoading(false);
    })();
  }, [me, conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(200));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[];
      setMessages(data);
    });

    return () => unsub();
  }, [conversationId]);

  // Mark conversation as read when opened / when new messages arrive
  useEffect(() => {
    if (!conversationId) return;
    startTransition(async () => {
      await markConversationRead(conversationId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const canSend = useMemo(() => text.trim().length > 0, [text]);

  const handleSend = () => {
    if (!canSend) return;
    const payload = text;
    setText('');

    startTransition(async () => {
      const res = await sendMessage({ conversationId, text: payload });
      if (!res?.success) {
        // restore text if failed
        setText(payload);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/chat')}>
          Back
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          {isOtherLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : otherUser ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUser.image} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="font-semibold truncate">{otherUser.name}</div>
            </>
          ) : (
            <div className="font-semibold">Chat</div>
          )}
        </div>

        <div className="w-16" />
      </div>

      <Card className="p-4 h-[70vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">No messages yet.</div>
          ) : (
            messages.map((m) => {
              const mine = me && m.senderId === me;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm border ${
                      mine
                        ? 'bg-[#BF3131]/10 border-[#BF3131]/20'
                        : 'bg-muted/40 border-border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="pt-3 border-t mt-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isPending}
          />
          <Button onClick={handleSend} disabled={!canSend || isPending}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}

