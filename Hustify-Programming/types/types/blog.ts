export interface BlogComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  content: string;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  author: {
    id: string;
    name: string;
    image: string;
    title?: string;
  };
  content: string;
  timestamp: string;
  location?: string;
  likes: string[];
  comments: BlogComment[];
  url?: string;
  photo?: string;
  reposts: string[];
  originalPost?: {
    id: string;
    author: {
      id: string;
      name: string;
      image: string;
    };
    content: string;
  };
} 