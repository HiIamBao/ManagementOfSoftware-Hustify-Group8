import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface FriendRecommendation {
  userId: string;
  fullName: string;
  avatarUrl: string;
  mutualFriendsCount: number;
  requested?: boolean;
}

export function FriendRecommendations({
  recommendations,
  onAddFriend,
}: {
  recommendations: FriendRecommendation[];
  onAddFriend: (userId: string) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No recommendations right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">People You May Know</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <Card key={rec.userId} className="p-4">
            <div className="flex items-center gap-3">
              <Link href={`/user/${rec.userId}`}>
                <Avatar className="h-12 w-12 cursor-pointer">
                  <AvatarImage src={rec.avatarUrl} alt={rec.fullName} />
                  <AvatarFallback>{rec.fullName[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/user/${rec.userId}`} className="font-medium hover:underline">
                  {rec.fullName}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {rec.mutualFriendsCount} mutual friends
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              disabled={!!rec.requested}
              onClick={() => onAddFriend(rec.userId)}
              variant={rec.requested ? 'secondary' : 'default'}
            >
              {rec.requested ? 'Request Sent' : 'Add Friend'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

