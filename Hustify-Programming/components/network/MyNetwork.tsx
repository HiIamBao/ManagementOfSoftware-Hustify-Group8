import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserMinus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Connection {
  id: string;
  name: string;
  image: string;
  title: string;
  connectedSince: Date;
}

interface MyNetworkProps {
  connections: Connection[];
  onRemove: (userId: string) => void;
}

export function MyNetwork({ connections, onRemove }: MyNetworkProps) {
  if (connections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No connections yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start connecting with other professionals to grow your network
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Your Connections ({connections.length})
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id} className="p-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={connection.image} alt={connection.name} />
                <AvatarFallback>{connection.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{connection.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {connection.title}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Connected since{" "}
                {connection.connectedSince.toLocaleDateString()}
              </p>
              <Button
                onClick={() => onRemove(connection.id)}
                variant="outline"
                className="flex items-center gap-2 w-full"
                size="sm"
              >
                <UserMinus className="h-4 w-4" />
                Remove Connection
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 