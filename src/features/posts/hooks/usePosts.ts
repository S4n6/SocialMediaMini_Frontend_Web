import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { postsService } from '../services/post.service';
import { CreatePostPayload } from '../types/create-post.types';
import type { Post, PaginatedResponse } from '@/types';
import type { InfiniteFeedResult } from '@/features/feed/types/feed.types';
import { FEED_QUERY_KEYS } from '@/features/feed/hooks/feed/useFeedQueries';
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
 * Implements **Optimistic UI**: instantly injects the new post at the
 * top of the infinite-scroll feed cache with `status: 'PROCESSING'` so
 * the user sees immediate feedback while the backend + Go worker handle
 * media processing asynchronously.
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

    // ── Optimistic update: push a "PROCESSING" placeholder into the feed ──
    onMutate: async ({ payload }) => {
      // 1. Cancel in-flight feed fetches so they don't overwrite the optimistic entry
      await queryClient.cancelQueries({
        queryKey: FEED_QUERY_KEYS.timeline(),
      });

      // 2. Snapshot current feed cache (for rollback on error)
      const previousFeed = queryClient.getQueryData<InfiniteFeedResult>(
        FEED_QUERY_KEYS.timelineWithParams({}),
      );

      // 3. Build a temporary optimistic post
      const optimisticPost: Post = {
        id: `optimistic-${Date.now()}`,
        content: payload.content || '',
        image: payload.media?.[0]?.url,
        author: {
          id: '',
          username: '',
          fullName: 'You',
          email: '',
        },
        status: 'PROCESSING' as const,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: payload.hashtags,
      };

      // 4. Prepend to the first page
      queryClient.setQueryData<InfiniteFeedResult>(
        FEED_QUERY_KEYS.timelineWithParams({}),
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [optimisticPost, ...(firstPage?.data ?? [])],
              },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      return { previousFeed };
    },

    // ── On success: replace the optimistic placeholder with the real post ──
    onSuccess: (serverPost, _variables, context) => {
      queryClient.setQueryData<InfiniteFeedResult>(
        FEED_QUERY_KEYS.timelineWithParams({}),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, idx) => {
              if (idx !== 0) return page;
              return {
                ...page,
                data: page.data.map((p) =>
                  p.id.startsWith('optimistic-')
                    ? {
                        ...p,
                        ...serverPost,
                        status: serverPost.status ?? 'PROCESSING',
                      }
                    : p,
                ),
              };
            }),
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      toast.success('Post created successfully!');
    },

    // ── On error: rollback to snapshot ──
    onError: (error: Error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(
          FEED_QUERY_KEYS.timelineWithParams({}),
          context.previousFeed,
        );
      }
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
