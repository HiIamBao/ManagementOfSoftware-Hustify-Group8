"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type ProfileFriend = {
  userId: string;
  fullName: string;
  avatarUrl: string;
};

export default function OtherUserFriends({
  friends,
  title = 'Friends',
}: {
  friends: ProfileFriend[];
  title?: string;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.fullName.toLowerCase().includes(q));
  }, [friends, search]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Input
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground">No friends to show.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No friends match your search.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Link
              key={f.userId}
              href={`/user/${f.userId}`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={f.avatarUrl} alt={f.fullName} />
                <AvatarFallback>{f.fullName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium truncate">{f.fullName}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

