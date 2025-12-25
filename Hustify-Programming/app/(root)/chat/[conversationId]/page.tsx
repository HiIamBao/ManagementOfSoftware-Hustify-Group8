import ChatRoomClient from './ChatRoomClient';

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <div className="container mx-auto px-4 py-6">
      <ChatRoomClient conversationId={conversationId} />
    </div>
  );
}

