"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { BlogPost } from './BlogPost';
import { CreatePost } from './CreatePost';
import { useUser } from '@/hooks/useUser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Clock, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getPosts, editPost, deletePost } from '@/lib/actions/blog.action';
import type { BlogPost as BlogPostType, BlogComment } from '@/types/blog';
import { redirect } from 'next/navigation';

// Sample locations - Should match with CreatePost locations
const LOCATIONS = [
  'All Locations',
  'Hanoi',
  'Ho Chi Minh City',
  'Da Nang',
  'Hai Phong',
  'Can Tho',
  'Nha Trang',
  'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' }
];

export function BlogFeed() {
  const { user, loading: userLoading, error: userError } = useUser();
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortOrder, setSortOrder] = useState('newest');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const POSTS_PER_PAGE = 10;

  // Redirect to login if no user
  useEffect(() => {
    if (!userLoading && !user && !userError) {
      redirect('/sign-in');
    }
  }, [user, userLoading, userError]);

  const loadPosts = useCallback(async (isInitial: boolean = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      
      const currentPage = isInitial ? 1 : page;
      const newPosts = await getPosts(currentPage * POSTS_PER_PAGE);
      
      if (isInitial) {
        setPosts(newPosts);
      } else {
        // Filter out any posts that already exist in the current list
        const existingPostIds = new Set(posts.map(post => post.id));
        const uniqueNewPosts = newPosts.filter(post => !existingPostIds.has(post.id));
        setPosts(prevPosts => [...prevPosts, ...uniqueNewPosts]);
      }
      
      setHasMore(newPosts.length === POSTS_PER_PAGE);
      
      if (!isInitial) {
        setPage(p => p + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, posts]);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, []);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadPosts]);

  // Observe last post
  useEffect(() => {
    const observer = observerRef.current;
    const lastPost = lastPostRef.current;
    
    if (observer && lastPost) {
      observer.observe(lastPost);
    }
    
    return () => {
      if (observer && lastPost) {
        observer.unobserve(lastPost);
      }
    };
  }, [posts]);

  const handleNewPost = (optimisticPost: BlogPostType) => {
    setPosts(prevPosts => [optimisticPost, ...prevPosts]);
  };

  const handlePostError = (tempId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== tempId));
  };

  const handlePostSuccess = (tempId: string, serverPost: BlogPostType) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === tempId ? serverPost : post
    ));
  };

  const handleEditPost = async (postId: string, newContent: string, url?: string) => {
    if (!user) return;

    try {
      await editPost({
        postId,
        userId: user.id,
        content: newContent,
        url
      });
      const updatedPosts = posts.map(post => 
        post.id === postId ? { ...post, content: newContent, url } : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    try {
      await deletePost(postId, user.id);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikeToggle = (postId: string, newLikes: string[]) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: newLikes } : post
    ));
  };

  const handleCommentAdd = (postId: string, newComment: BlogComment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const existingTempIndex = post.comments.findIndex(
          comment => comment.id === newComment.id
        );

        const updatedComments = [...post.comments];
        if (existingTempIndex !== -1) {
          updatedComments[existingTempIndex] = newComment;
        } else {
          updatedComments.push(newComment);
        }

        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  const handleCommentEdit = (postId: string, commentId: string, updatedComment: BlogComment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment =>
          comment.id === commentId ? updatedComment : comment
        );
        return { ...post, comments: updatedComments };
      }
      return post;
    }));
  };

  const handleCommentDelete = (postId: string, commentId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId)
        };
      }
      return post;
    }));
  };

  // Filter posts
  const filteredPosts = posts
    .filter(post => selectedLocation === 'All Locations' || post.location === selectedLocation)
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
    });

  if (userLoading || (loading && posts.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-destructive">Error loading user data</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  const currentUser = {
    id: user.id,
    name: user.name,
    image: user.image || `https://avatar.vercel.sh/${user.id}`
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-[#2C2C2C]">
      {/* Create Post Section */}
      <div className="mb-8">
        <CreatePost 
          user={currentUser}
          onOptimisticPost={handleNewPost}
          onPostError={handlePostError}
          onPostSuccess={handlePostSuccess}
        />
      </div>
      
      {/* Posts Section */}
      <div className="bg-muted/30">
        {/* Header with Filters */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Posts</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter and Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Location</DropdownMenuLabel>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#B10000]" />
                      <SelectValue placeholder="Filter by location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <SelectValue placeholder="Sort by time" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <div 
              key={`${post.id}-${index}`}
              ref={index === filteredPosts.length - 1 ? lastPostRef : null}
              className="bg-card border border-border rounded-lg p-4"
            >
              <BlogPost
                {...post}
                currentUser={currentUser}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onLikeToggle={handleLikeToggle}
                onCommentAdd={handleCommentAdd}
                onCommentEdit={handleCommentEdit}
                onCommentDelete={handleCommentDelete}
              />
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="bg-card border border-border rounded-lg text-center py-8 text-muted-foreground">
              {selectedLocation === 'All Locations' 
                ? 'No posts available.'
                : `No posts available in ${selectedLocation}.`}
            </div>
          )}

          {loading && posts.length > 0 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          )}

          {!loading && !hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No more posts to load
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 