import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SuggestedUser {
  id: string;
  name: string;
  image: string;
  title: string;
  mutualConnections: number;
}

interface SuggestedConnectionsProps {
  suggestions: SuggestedUser[];
  onConnect: (userId: string) => void;
}

export function SuggestedConnections({ suggestions, onConnect }: SuggestedConnectionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No connection suggestions at the moment</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((user) => (
        <Card key={user.id} className="p-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{user.title}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {user.mutualConnections} mutual connections
            </p>
            <Button
              onClick={() => onConnect(user.id)}
              className="flex items-center gap-2 w-full"
              size="sm"
            >
              <UserPlus className="h-4 w-4" />
              Connect
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 