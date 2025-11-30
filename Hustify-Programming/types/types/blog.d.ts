export interface BlogPost {
  id: string;
  author: {
    id: string;
    name: string;
    image: string;
    title: string;
  };
  content: string;
  timestamp: string; // ISO string format
  location: string;
  likes: string[]; // Array of userIds who liked the post
  comments: BlogComment[];
  url?: string;
  photo?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  content: string;
  timestamp: string; // ISO string format
} 