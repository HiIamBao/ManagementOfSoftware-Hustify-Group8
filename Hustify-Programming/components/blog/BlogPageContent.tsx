'use client';

import { useState } from 'react';
import { BlogFeed } from './BlogFeed';
import { SuggestedConnections } from '@/components/network/SuggestedConnections';
import { StickyFooter } from './StickyFooter';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    image: string;
    title: string;
  };
  content: string;
  timestamp: Date;
  location: string;
  likes: number;
  comments: number;
  url?: string;
  photo?: string;
}

// Sample data - In a real app, this would come from a database
const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'John Doe',
      image: '/avatars/user1.jpg',
      title: 'Software Engineer'
    },
    content: 'Just deployed my first Next.js application! Check out the link below 🚀',
    timestamp: new Date('2024-03-30T10:00:00'),
    location: 'Ho Chi Minh City',
    likes: 15,
    comments: 5,
    url: 'https://nextjs.org'
  },
  {
    id: '2',
    author: {
      id: 'user2',
      name: 'Jane Smith',
      image: '/avatars/user2.jpg',
      title: 'UX Designer'
    },
    content: 'Working on some exciting new design concepts for our upcoming project.',
    timestamp: new Date('2024-03-30T09:30:00'),
    location: 'Hanoi',
    likes: 23,
    comments: 8
  },
];

const SUGGESTED_USERS = [
  {
    id: 'user3',
    name: 'Alice Johnson',
    image: '/avatars/user3.jpg',
    title: 'Frontend Developer',
    mutualConnections: 12
  },
  {
    id: 'user4',
    name: 'Bob Wilson',
    image: '/avatars/user4.jpg',
    title: 'UX Designer',
    mutualConnections: 8
  },
  {
    id: 'user5',
    name: 'Carol Brown',
    image: '/avatars/user5.jpg',
    title: 'Product Manager',
    mutualConnections: 15
  }
];

const CURRENT_USER = {
  id: 'user1',
  name: 'John Doe',
  image: '/avatars/user1.jpg'
};

export function BlogPageContent() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [suggestedUsers, setSuggestedUsers] = useState(SUGGESTED_USERS);

  const handleCreatePost = (content: string, location: string, url?: string, photo?: File) => {
    console.log('Creating post with:', { content, location, url, photo });

    const newPost: Post = {
      id: `post${posts.length + 1}`,
      author: {
        id: CURRENT_USER.id,
        name: CURRENT_USER.name,
        image: CURRENT_USER.image,
        title: 'Software Engineer'
      },
      content,
      timestamp: new Date(),
      location,
      likes: 0,
      comments: 0
    };

    // Only add url if it exists and is not empty
    if (url && url.trim()) {
      newPost.url = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    }

    // Handle photo file
    if (photo) {
      const photoUrl = URL.createObjectURL(photo);
      newPost.photo = photoUrl;
    }

    console.log('New post object:', newPost);
    setPosts([newPost, ...posts]);
  };

  const handleEditPost = (postId: string, newContent: string, url?: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedPost = { ...post, content: newContent };

        // Handle URL update
        if (url && url.trim()) {
          updatedPost.url = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
        } else {
          delete updatedPost.url;
        }

        return updatedPost;
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };



  const handleConnect = (userId: string) => {
    // In a real app, this would send a connection request
    alert(`Connection request sent to user ${userId}`);
    // Remove user from suggestions after connecting
    setSuggestedUsers(suggestedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#2C2C2C]">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <BlogFeed
              posts={posts}
              currentUser={CURRENT_USER}
              onCreatePost={handleCreatePost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <div className="flex-0">
              <SuggestedConnections
                suggestions={suggestedUsers}
                onConnect={handleConnect}
              />
            </div>
            <StickyFooter />
          </div>
        </div>
      </div>
    </div>
  );
} 