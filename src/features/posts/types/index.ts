import { User } from "@/types/user";

export interface Post {
  id: string;
  content: string;
  image?: string;
  video?: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  location?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CreatePostData {
  content: string;
  image?: File | string;
  video?: File | string;
  tags?: string[];
  location?: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface PostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PostFilters {
  userId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "newest" | "oldest" | "popular";
}
