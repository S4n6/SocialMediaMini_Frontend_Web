import type { Post } from "@/types/post";
import type { ApiResponse } from "@/types/api";
import type { CreatePostFormData } from "@/lib/validations/schemas";

// Posts hook configuration
export interface PostsConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enableToast?: boolean;
  userId?: string;
  postId?: string;
  pageSize?: number;
}

// Posts state interface
export interface PostsState {
  feedPosts: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: PostsError | null;
  pagination: {
    hasNextFeedPage: boolean;
    hasNextUserPage: boolean;
    isFetchingNextFeedPage: boolean;
    isFetchingNextUserPage: boolean;
  };
}

// Posts actions interface
export interface PostsActions {
  createPost: (postData: CreatePostFormData) => Promise<ApiResponse<Post>>;
  updatePost: (
    postId: string,
    postData: Partial<CreatePostFormData>
  ) => Promise<ApiResponse<Post>>;
  deletePost: (postId: string) => Promise<ApiResponse<null>>;
  toggleLikePost: (postId: string) => Promise<ApiResponse<unknown>>;
  uploadImages: (files: File[]) => Promise<ApiResponse<string[]>>;
  fetchNextFeedPage: () => Promise<any>;
  fetchNextUserPage: () => Promise<any>;
}

// Posts error interface
export interface PostsError {
  code: string;
  message: string;
  status?: number;
}

// Posts query options
export interface PostsQueryOptions extends PostsConfig {
  enabled?: boolean;
  select?: (data: any) => any;
}

// Posts mutation options
export interface PostsMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: PostsError) => void;
}

// Upload image data interface
export interface UploadImageData {
  file: File;
  progress?: number;
}

// Post pagination metadata
export interface PostsPagination {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Post feed response
export interface PostsFeedResponse {
  data: Post[];
  pagination: PostsPagination;
}

// Re-export validation types
export type { CreatePostFormData };
