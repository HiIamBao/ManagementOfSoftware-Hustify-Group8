import { listConversationsForCurrentUser } from '@/lib/actions/chat.action';
import ChatListClient from './ChatListClient';

export default async function ChatPage() {
  const conversations = await listConversationsForCurrentUser();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ChatListClient initialConversations={conversations} />
    </div>
  );
}

