import { getFriendsList, getFriendRecommendations, getIncomingFriendRequests } from '@/lib/actions/friends.action';
import SocialNetworkClient from './social-network-client';

export default async function NetworkPage() {
  const [friends, recommendations, incoming] = await Promise.all([
    getFriendsList(),
    getFriendRecommendations(),
    getIncomingFriendRequests(),
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <SocialNetworkClient
        initialFriends={friends}
        initialRecommendations={recommendations}
        initialIncomingRequests={incoming}
      />
    </div>
  );
}

