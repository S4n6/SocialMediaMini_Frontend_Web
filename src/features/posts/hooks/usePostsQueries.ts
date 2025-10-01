import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { postsService } from "@/services/api.service";

// Inline interface for now
interface PostsQueryOptions {
  userId?: string;
  postId?: string;
  pageSize?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enabled?: boolean;
}

// Create query keys for posts domain
const postsKeys = {
  all: ["posts"] as const,
  lists: () => ["posts", "list"] as const,
  list: (filters: any) => ["posts", "list", filters] as const,
  details: () => ["posts", "detail"] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
};

/**
 * Posts queries hook - handles all read operations
 */
export const usePostsQueries = (options: PostsQueryOptions = {}) => {
  const {
    userId,
    postId,
    pageSize = 10,
    staleTime = 2 * 60 * 1000, // 2 minutes
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    enabled = true,
  } = options;

  /**
   * Feed posts infinite query
   */
  const feedPosts = useInfiniteQuery({
    queryKey: [...postsKeys.lists(), "feed"],
    queryFn: ({ pageParam = 1 }) =>
      postsService.getFeedPosts(pageParam, pageSize),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry,
  });

  /**
   * User posts infinite query
   */
  const userPosts = useInfiniteQuery({
    queryKey: [...postsKeys.list({ userId }), "user-posts"],
    queryFn: ({ pageParam = 1 }) =>
      postsService.getUserPosts(userId!, pageParam, pageSize),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!userId,
    staleTime,
    gcTime: cacheTime,
    retry,
  });

  /**
   * Single post query
   */
  const singlePost = useQuery({
    queryKey: [...postsKeys.detail(postId!)],
    queryFn: () => postsService.getPost(postId!),
    enabled: enabled && !!postId,
    staleTime,
    gcTime: cacheTime,
    retry,
    select: (response) => response.data,
  });

  return {
    feedPosts,
    userPosts,
    singlePost,
  };
};

export default usePostsQueries;
