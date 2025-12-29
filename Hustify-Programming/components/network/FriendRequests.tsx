import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface IncomingFriendRequest {
  requestId: string;
  fromUserId: string;
  fromName: string;
  fromAvatarUrl: string;
  createdAt: string;
}

export function FriendRequests({
  requests,
  onAccept,
  onDecline,
}: {
  requests: IncomingFriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Incoming Requests</h2>
      {requests.length === 0 ? (
        <div className="text-sm text-muted-foreground">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.requestId} className="p-4">
              <div className="flex items-center gap-3">
                <Link href={`/user/${req.fromUserId}`}>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={req.fromAvatarUrl} alt={req.fromName} />
                    <AvatarFallback>{req.fromName[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link
                    href={`/user/${req.fromUserId}`}
                    className="font-medium hover:underline"
                  >
                    {req.fromName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{req.createdAt}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onAccept(req.requestId)}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecline(req.requestId)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

