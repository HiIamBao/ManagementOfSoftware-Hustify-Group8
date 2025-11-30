'use client';

import { useState, useEffect } from 'react';
import { ConnectionRequests } from './ConnectionRequests';
import { SuggestedConnections } from './SuggestedConnections';
import { MyNetwork } from './MyNetwork';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, UserCheck } from 'lucide-react';

// Sample data - Replace with real data from API
const SAMPLE_REQUESTS = [
  {
    id: 'req1',
    user: {
      id: 'user1',
      name: 'Hoàng Bá Bảo',
      image: '/avatars/user1.jpg',
      title: 'Software Engineer at Google',
      mutualConnections: 12
    },
    timestamp: new Date('2024-03-30T10:00:00')
  },
  {
    id: 'req2',
    user: {
      id: 'user2',
      name: 'Tuong Phi Tuan',
      image: '/avatars/user2.jpg',
      title: 'Product Manager at Meta',
      mutualConnections: 8
    },
    timestamp: new Date('2024-03-29T15:30:00')
  }
];

const SAMPLE_SUGGESTIONS = [
  {
    id: 'sug1',
    name: 'Tran Quang Hung',
    image: '/avatars/user3.jpg',
    title: 'Frontend Developer at Amazon',
    mutualConnections: 15
  },
  {
    id: 'sug2',
    name: 'Le Ngoc Quang Hung',
    image: '/avatars/user4.jpg',
    title: 'UX Designer at Apple',
    mutualConnections: 10
  },
  {
    id: 'sug3',
    name: 'Carol Brown',
    image: '/avatars/user5.jpg',
    title: 'Backend Developer at Microsoft',
    mutualConnections: 7
  }
];

const SAMPLE_NETWORK = [
  {
    id: 'net1',
    name: 'David Lee',
    image: '/avatars/user6.jpg',
    title: 'Tech Lead at Netflix',
    connectedSince: new Date('2024-01-15')
  },
  {
    id: 'net2',
    name: 'Emma Davis',
    image: '/avatars/user7.jpg',
    title: 'Senior Developer at Spotify',
    connectedSince: new Date('2024-02-20')
  }
];

export default function NetworkPageContent() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState(SAMPLE_REQUESTS);
  const [suggestions, setSuggestions] = useState(SAMPLE_SUGGESTIONS);
  const [network, setNetwork] = useState(SAMPLE_NETWORK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    // In a real app, make API call to accept request
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setNetwork([...network, {
        id: request.user.id,
        name: request.user.name,
        image: request.user.image,
        title: request.user.title,
        connectedSince: new Date()
      }]);
      setRequests(requests.filter(r => r.id !== requestId));
    }
  };

  const handleIgnoreRequest = (requestId: string) => {
    // In a real app, make API call to ignore request
    setRequests(requests.filter(r => r.id !== requestId));
  };

  const handleConnect = (userId: string) => {
    // In a real app, make API call to send connection request
    setSuggestions(suggestions.filter(s => s.id !== userId));
  };

  const handleRemoveConnection = (userId: string) => {
    // In a real app, make API call to remove connection
    setNetwork(network.filter(n => n.id !== userId));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Network</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <span>Pending ({requests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <span>Suggestions ({suggestions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>My Connections ({network.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <ConnectionRequests
              requests={requests}
              onAccept={handleAcceptRequest}
              onIgnore={handleIgnoreRequest}
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <SuggestedConnections
              suggestions={suggestions}
              onConnect={handleConnect}
            />
          </TabsContent>

          <TabsContent value="network">
            <MyNetwork
              connections={network}
              onRemove={handleRemoveConnection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 