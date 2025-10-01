import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { postsService } from "../services/posts.service";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { Comment } from "../types";

/**
 * Hook for fetching post comments
 */
export const useComments = (postId: string) => {
  const { handleError } = useErrorHandler("useComments");

  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam = 1 }) =>
      postsService.getComments(postId, pageParam, 10),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!postId,
    // react-query options do not accept onError in some typing permutations;
    // errors are handled in mutations below using the shared error handler.
  });
};

/**
 * Hook for comment actions
 */
export const useCommentActions = (postId: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler("useCommentActions");

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => postsService.addComment(postId, content, parentId),
    onSuccess: (newComment: any) => {
      // Add comment to the comments list
      queryClient.setQueryData(["comments", postId], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        const newData = { ...oldData };
        if (newData.pages[0]) {
          newData.pages[0] = {
            ...newData.pages[0],
            data: [newComment, ...newData.pages[0].data],
          };
        }
        return newData;
      });

      // Update post comments count in all post queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: any) =>
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

      toast.success("Comment added!");
    },
    onError: (error: unknown) => {
      handleError(error, {
        action: "add_comment",
        component: "useCommentActions",
        postId: postId,
      } as any);
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string | undefined) =>
      commentId
        ? postsService.deleteComment(postId, commentId)
        : Promise.reject(new Error("Missing commentId")),
    onSuccess: (_, commentId) => {
      // Remove comment from the list
      queryClient.setQueryData(["comments", postId], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter(
              (comment: Comment) => comment.id !== commentId
            ),
          })),
        };
      });

      // Update post comments count
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;

        const updatePost = (post: any) =>
          post.id === postId
            ? { ...post, commentsCount: Math.max(0, post.commentsCount - 1) }
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

      toast.success("Comment deleted!");
    },
    onError: (error: unknown, commentId?: string) => {
      handleError(error, {
        action: "delete_comment",
        component: "useCommentActions",
        postId: postId,
        commentId: commentId,
      } as any);
    },
  });

  // Like comment
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string | undefined) =>
      commentId
        ? postsService.toggleCommentLike(postId, commentId)
        : Promise.reject(new Error("Missing commentId")),
    onSuccess: (result: any, commentId?: string) => {
      // Update comment in the list
      queryClient.setQueryData(["comments", postId], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((comment: Comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: result?.data?.isLiked ?? result?.isLiked,
                    likesCount: result?.data?.likesCount ?? result?.likesCount,
                  }
                : comment
            ),
          })),
        };
      });
    },
    onError: (error: unknown, commentId?: string) => {
      handleError(error, {
        action: "like_comment",
        component: "useCommentActions",
        postId: postId,
        commentId: commentId,
      } as any);
    },
  });

  return {
    // Actions
    addComment: (content: string, parentId?: string) =>
      addCommentMutation.mutate({ content, parentId }),
    deleteComment: deleteCommentMutation.mutate,
    likeComment: likeCommentMutation.mutate,

    // Loading states
    isAddingComment: addCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isLikingComment: likeCommentMutation.isPending,

    // Error states
    addCommentError: addCommentMutation.error,
    deleteCommentError: deleteCommentMutation.error,
    likeCommentError: likeCommentMutation.error,
  };
};
