import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MessageCircle, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  image: string;
  title: string;
  mutualConnections: number;
}

interface SuggestedUsersProps {
  users: User[];
  onMessage: (userId: string) => void;
  onConnect: (userId: string) => void;
}

export function SuggestedUsers({ users = [], onMessage, onConnect }: SuggestedUsersProps) {
  if (users.length === 0) {
    return (
      <div className="bg-background rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold mb-2">People You May Know</h2>
        <p className="text-sm text-muted-foreground">
          No suggestions available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background/95 rounded-lg border border-border p-4 mt-[23px] shadow-md hover:shadow-lg transition-all duration-300 hover:bg-background">
      <h2 className="text-lg font-semibold mb-4 text-primary">People You May Know</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.mutualConnections} mutual connections
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => onMessage(user.id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => onConnect(user.id)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 