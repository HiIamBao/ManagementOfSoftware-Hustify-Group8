import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCheck, UserX } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ConnectionRequest {
  id: string;
  user: {
    id: string;
    name: string;
    image: string;
    title: string;
    mutualConnections: number;
  };
  timestamp: Date;
}

interface ConnectionRequestsProps {
  requests: ConnectionRequest[];
  onAccept: (requestId: string) => void;
  onIgnore: (requestId: string) => void;
}

export function ConnectionRequests({ requests, onAccept, onIgnore }: ConnectionRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending connection requests</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => (
        <Card key={request.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={request.user.image} alt={request.user.name} />
              <AvatarFallback>{request.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{request.user.name}</h3>
              <p className="text-sm text-muted-foreground">{request.user.title}</p>
              <p className="text-sm text-muted-foreground">
                {request.user.mutualConnections} mutual connections
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => onAccept(request.id)}
                  className="flex items-center gap-2 bg-[#B10000] hover:bg-[#B10000]/80 text-white"
                  size="sm"
                >
                  <UserCheck className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  onClick={() => onIgnore(request.id)}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <UserX className="h-4 w-4" />
                  Ignore
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 