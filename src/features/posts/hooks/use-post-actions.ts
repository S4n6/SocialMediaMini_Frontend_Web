import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { postsService } from "../services/posts.service";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostFilters,
} from "../types";

/**
 * Hook for post actions (like, bookmark, share, comment)
 */
export const usePostActions = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("usePostActions");

  // Like/Unlike post
  const likeMutation = useMutation({
    mutationFn: (postId: string | undefined) =>
      postId
        ? postsService.toggleLike(postId)
        : Promise.reject(new Error("Missing postId")),
    onSuccess: (result: any, postId?: string) => {
      const data = result && result.data ? result.data : result;
      // Update all queries that might contain this post
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: Post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: data.isLiked,
                likesCount: data.likesCount,
              }
            : post;

        // Handle infinite query data
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map(updatePost),
            })),
          };
        }

        // Handle regular query data
        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updatePost),
          };
        }

        return oldData;
      });

      // Also update single post queries
      queryClient.setQueryData(["post", postId], (oldData: Post | undefined) =>
        oldData
          ? {
              ...oldData,
              isLiked: data.isLiked,
              likesCount: data.likesCount,
            }
          : oldData
      );
    },
    onError: (error: unknown, postId?: string) => {
      handleError(error, {
        action: "toggle_like",
        component: "usePostActions",
        postId: postId,
      } as any);
    },
  });

  // Bookmark/Unbookmark post
  const bookmarkMutation = useMutation({
    mutationFn: (postId: string | undefined) =>
      postId
        ? postsService.toggleBookmark(postId)
        : Promise.reject(new Error("Missing postId")),
    onSuccess: (result: any, postId?: string) => {
      const data = result && result.data ? result.data : result;
      // Update queries similar to like mutation
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: Post) =>
          post.id === postId
            ? { ...post, isBookmarked: data.isBookmarked }
            : post;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map(updatePost),
            })),
          };
        }

        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updatePost),
          };
        }

        return oldData;
      });

      queryClient.setQueryData(["post", postId], (oldData: Post | undefined) =>
        oldData ? { ...oldData, isBookmarked: data.isBookmarked } : oldData
      );
    },
    onError: (error: unknown, postId?: string) => {
      handleError(error, {
        action: "toggle_bookmark",
        component: "usePostActions",
        postId: postId,
      } as any);
    },
  });

  // Share post
  const shareMutation = useMutation({
    mutationFn: (postId: string | undefined) =>
      postId
        ? postsService.sharePost(postId)
        : Promise.reject(new Error("Missing postId")),
    onSuccess: (_: any, postId?: string) => {
      // Increment shares count optimistically
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: Post) =>
          post.id === postId
            ? { ...post, sharesCount: post.sharesCount + 1 }
            : post;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map(updatePost),
            })),
          };
        }

        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updatePost),
          };
        }

        return oldData;
      });
    },
    onError: (error: unknown, postId?: string) => {
      handleError(error, {
        action: "share_post",
        component: "usePostActions",
        postId: postId,
      } as any);
    },
  });

  // Add comment
  const commentMutation = useMutation({
    mutationFn: ({
      postId,
      content,
      parentId,
    }: {
      postId: string;
      content: string;
      parentId?: string;
    }) => postsService.addComment(postId, content, parentId),
    onSuccess: (newComment: any, { postId }: any) => {
      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      // Update post comments count
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: Post) =>
          post.id === postId
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map(updatePost),
            })),
          };
        }

        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updatePost),
          };
        }

        return oldData;
      });
    },
    onError: (error: unknown, { postId }: any) => {
      handleError(error, {
        action: "add_comment",
        component: "usePostActions",
        postId: postId,
      } as any);
    },
  });

  return {
    // Actions
    toggleLike: likeMutation.mutate,
    toggleBookmark: bookmarkMutation.mutate,
    sharePost: shareMutation.mutate,
    addComment: (postId: string, content: string, parentId?: string) =>
      commentMutation.mutate({ postId, content, parentId }),

    // Loading states
    isLiking: likeMutation.isPending,
    isBookmarking: bookmarkMutation.isPending,
    isSharing: shareMutation.isPending,
    isCommenting: commentMutation.isPending,

    // Error states
    likeError: likeMutation.error,
    bookmarkError: bookmarkMutation.error,
    shareError: shareMutation.error,
    commentError: commentMutation.error,
  };
};

/**
 * Hook for fetching posts with pagination
 */
export const usePosts = (filters?: PostFilters) => {
  const { handleError } = useErrorHandler("usePosts");

  return useInfiniteQuery({
    queryKey: ["posts", filters],
    queryFn: ({ pageParam = 1 }) =>
      postsService.getPosts(pageParam, 10, filters),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    // Errors for queries are surfaced to callers; mutations use the shared error handler
  });
};

/**
 * Hook for fetching user feed
 */
export const useFeed = () => {
  const { handleError } = useErrorHandler("useFeed");

  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) => postsService.getFeedPosts(pageParam, 10),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });
};

/**
 * Hook for fetching single post
 */
export const usePost = (postId: string) => {
  const { handleError } = useErrorHandler("usePost");

  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => postsService.getPost(postId),
    enabled: !!postId,
  });
};

/**
 * Hook for creating posts
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("useCreatePost");

  return useMutation({
    mutationFn: postsService.createPost,
    onSuccess: (newPost) => {
      // Add new post to the top of feeds
      queryClient.setQueryData(["feed"], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        const newData = { ...oldData };
        if (newData.pages[0]) {
          newData.pages[0] = {
            ...newData.pages[0],
            data: [newPost, ...newData.pages[0].data],
          };
        }
        return newData;
      });

      // Invalidate posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast.success("Post created successfully!");
    },
    onError: (error) => {
      handleError(error, {
        action: "create_post",
        component: "useCreatePost",
      });
    },
  });
};

/**
 * Hook for updating posts
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("useUpdatePost");

  return useMutation({
    mutationFn: (variables: {
      postId: string;
      postData: Partial<CreatePostData>;
    }) => postsService.updatePost(variables.postId, variables.postData),
    onSuccess: (updatedPostRes: any) => {
      const updatedPost =
        updatedPostRes && updatedPostRes.data
          ? updatedPostRes.data
          : updatedPostRes;
      // Update all queries containing this post
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: Post) =>
          post.id === updatedPost.id ? updatedPost : post;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map(updatePost),
            })),
          };
        }

        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map(updatePost),
          };
        }

        return oldData;
      });

      // Update single post query
      queryClient.setQueryData(["post", updatedPost.id], updatedPost);

      toast.success("Post updated successfully!");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "update_post",
        component: "useUpdatePost",
      } as any);
    },
  });
};

/**
 * Hook for deleting posts
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("useDeletePost");

  return useMutation({
    mutationFn: postsService.deletePost,
    onSuccess: (_, postId) => {
      // Remove post from all queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const filterPost = (post: Post) => post.id !== postId;

        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter(filterPost),
            })),
          };
        }

        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter(filterPost),
          };
        }

        return oldData;
      });

      // Remove single post query
      queryClient.removeQueries({ queryKey: ["post", postId] });

      toast.success("Post deleted successfully!");
    },
    onError: (error, postId) => {
      handleError(error, {
        action: "delete_post",
        component: "useDeletePost",
        postId: postId,
      } as any);
    },
  });
};
