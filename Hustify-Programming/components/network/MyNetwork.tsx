import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserMinus, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Friend {
  userId: string;
  fullName: string;
  avatarUrl: string;
  subtitle: string;
  connectedSince: string;
}

interface FriendsListProps {
  friends: Friend[];
  onAction: (userId: string, action: 'remove' | 'message') => void;
}

export function FriendsList({ friends, onAction }: FriendsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven&apos;t added any friends yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start connecting with other professionals to grow your network.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Your Friends ({filteredFriends.length})
        </h2>
        <Input
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFriends.map((friend) => (
          <Card key={friend.userId} className="p-4">
            <div className="flex flex-col items-center text-center">
              <Link href={`/user/${friend.userId}`}>
                <Avatar className="h-24 w-24 mb-4 cursor-pointer">
                  <AvatarImage src={friend.avatarUrl} alt={friend.fullName} />
                  <AvatarFallback>{friend.fullName[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <Link href={`/user/${friend.userId}`}>
                <h3 className="font-semibold hover:underline cursor-pointer">
                  {friend.fullName}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-2">
                {friend.subtitle}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {friend.connectedSince}
              </p>
              <div className="flex w-full gap-2">
                <Button
                  onClick={() => onAction(friend.userId, 'message')}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  onClick={() => onAction(friend.userId, 'remove')}
                  variant="destructive"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}