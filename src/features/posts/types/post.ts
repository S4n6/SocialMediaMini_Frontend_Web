import type { User } from "@/types";

// Post types
export interface Post {
  id: string;
  content: string;
  author: User;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}
