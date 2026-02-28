import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { postsService } from '../services/post.service';
import { CreatePostPayload } from '../types/create-post.types';
import type { Post, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

// Query keys
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => ['posts', 'list'] as const,
  list: (filters: any) => ['posts', 'list', filters] as const,
  details: () => ['posts', 'detail'] as const,
  detail: (id: string) => ['posts', 'detail', id] as const,
  feed: () => ['posts', 'feed'] as const,
  userPosts: (userId: string) => ['posts', 'user', userId] as const,
};

/**
 * Hook for post queries (read operations)
 */
export const usePostsQuery = () => {
  const queryClient = useQueryClient();

  // Get single post
  const usePost = (postId: string, enabled = true) =>
    useQuery({
      queryKey: postsKeys.detail(postId),
      queryFn: () => postsService.getPost(postId),
      enabled: enabled && !!postId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  // Get user posts
  const useUserPosts = (userId: string, enabled = true) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'user', string],
      number
    >({
      queryKey: postsKeys.userPosts(userId),
      queryFn: ({ pageParam }) =>
        postsService.getUserPosts(userId, pageParam, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled: enabled && !!userId,
      staleTime: 2 * 60 * 1000,
    });

  // Get feed posts
  const useFeedPosts = (enabled = true) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'feed'],
      number
    >({
      queryKey: postsKeys.feed(),
      queryFn: ({ pageParam }) => postsService.getFeedPosts(pageParam, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled,
      staleTime: 1 * 60 * 1000, // 1 minute for feed
    });

  // Get posts with filters
  const usePosts = (
    filters: { authorId?: string; hashtag?: string; search?: string } = {},
    enabled = true,
  ) =>
    useInfiniteQuery<
      PaginatedResponse<Post>,
      Error,
      PaginatedResponse<Post>,
      readonly ['posts', 'list', any],
      number
    >({
      queryKey: postsKeys.list(filters),
      queryFn: ({ pageParam }) => postsService.getPosts(pageParam, 10, filters),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.page < lastPage.pagination.totalPages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      enabled,
      staleTime: 2 * 60 * 1000,
    });

  return {
    usePost,
    useUserPosts,
    useFeedPosts,
    usePosts,
  };
};

/**
 * Hook for post mutations (write operations).
 *
 * NOTE: Media upload is intentionally NOT handled here anymore.
 * The caller (CreatePostDialog) uses `useDirectUpload` to get the final CDN
 * URLs, then passes a fully-resolved `CreatePostPayload` to `createPost`.
 * This keeps the mutation focused on a single responsibility: POST /posts.
 */
export const usePostsMutation = () => {
  const queryClient = useQueryClient();

  // Create post — expects media URLs already resolved by useDirectUpload
  const createPost = useMutation({
    mutationFn: ({ payload }: { payload: CreatePostPayload }) =>
      postsService.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });
      toast.success('Post created successfully!');
    },
    onError: (error: Error) => {
      console.error('[createPost] Failed:', error);
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: Partial<CreatePostPayload>;
    }) => postsService.updatePost(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });

      toast.success('Post updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() });

      toast.success('Post deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  return {
    createPost,
    updatePost,
    deletePost,
  };
};
