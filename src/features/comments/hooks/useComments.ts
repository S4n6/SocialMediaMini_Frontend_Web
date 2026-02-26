'use client';

import { useState, useCallback, useMemo } from 'react';
import { Comment, UseCommentsReturn, UseCommentsProps } from '../types';

// Mock API delay for development
const API_DELAY = 300;

// Mock API functions (to be replaced with real API calls)
const mockAddComment = async (
  postId: string,
  content: string,
  userId: string,
  parentId?: string,
): Promise<Comment> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));

  return {
    id: Math.random().toString(36).substr(2, 9),
    content,
    authorId: userId,
    postId,
    parentId,
    author: {
      id: userId,
      username: 'current_user',
      fullName: 'Current User',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf91d3a3?w=150',
    },
    replies: [],
    reactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      reactions: 0,
      replies: 0,
    },
  };
};

const mockUpdateComment = async (
  commentId: string,
  content: string,
  userId: string,
): Promise<Comment> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));

  // Return updated comment (mock)
  return {
    id: commentId,
    content,
    authorId: userId,
    postId: 'post-id',
    author: {
      id: userId,
      username: 'current_user',
      fullName: 'Current User',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf91d3a3?w=150',
    },
    replies: [],
    reactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      reactions: 0,
      replies: 0,
    },
  };
};

const mockLikeComment = async (
  commentId: string,
  userId: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));
};

const mockDeleteComment = async (
  commentId: string,
  userId: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));
};

// Helper function to recursively update comments
const updateCommentInTree = (
  comments: Comment[],
  commentId: string,
  updater: (comment: Comment) => Comment,
): Comment[] => {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, commentId, updater),
      };
    }
    return comment;
  });
};

// Helper function to add comment to tree
const addCommentToTree = (
  comments: Comment[],
  newComment: Comment,
): Comment[] => {
  if (!newComment.parentId) {
    // Top-level comment
    return [newComment, ...comments];
  }

  // Reply to existing comment
  return updateCommentInTree(
    comments,
    newComment.parentId,
    (parentComment) => ({
      ...parentComment,
      replies: [newComment, ...(parentComment.replies || [])],
      _count: {
        reactions: parentComment._count?.reactions || 0,
        replies: (parentComment._count?.replies || 0) + 1,
      },
    }),
  );
};

// Helper function to remove comment from tree
const removeCommentFromTree = (
  comments: Comment[],
  commentId: string,
): Comment[] => {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies
        ? removeCommentFromTree(comment.replies, commentId)
        : [],
    }));
};

// Helper function to count total comments recursively
const countComments = (comments: Comment[]): number => {
  return comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
  }, 0);
};

export const useComments = ({
  postId,
  initialComments = [],
  currentUserId = 'current-user',
  pageSize = 20,
}: UseCommentsProps): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Calculate total comments count
  const totalCount = useMemo(() => countComments(comments), [comments]);

  // Add comment
  const addComment = useCallback(
    async (content: string, parentId?: string): Promise<void> => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Optimistic update
        const optimisticComment: Comment = {
          id: `temp-${Date.now()}`,
          content,
          authorId: currentUserId,
          postId,
          parentId,
          author: {
            id: currentUserId,
            username: 'current_user',
            fullName: 'Current User',
            avatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf91d3a3?w=150',
          },
          replies: [],
          reactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            reactions: 0,
            replies: 0,
          },
        };

        setComments((prev) => addCommentToTree(prev, optimisticComment));

        // Make API call
        const newComment = await mockAddComment(
          postId,
          content,
          currentUserId,
          parentId,
        );

        // Update with real data
        setComments((prev) =>
          updateCommentInTree(prev, optimisticComment.id, () => newComment),
        );
      } catch (err) {
        setError('Failed to add comment');
        // Revert optimistic update
        setComments((prev) =>
          removeCommentFromTree(prev, `temp-${Date.now()}`),
        );
        console.error('Error adding comment:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, currentUserId, isLoading],
  );

  // Update comment
  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<void> => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      const previousComments = comments;

      try {
        // Optimistic update
        setComments((prev) =>
          updateCommentInTree(prev, commentId, (comment) => ({
            ...comment,
            content,
            updatedAt: new Date().toISOString(),
          })),
        );

        // Make API call
        await mockUpdateComment(commentId, content, currentUserId);
      } catch (err) {
        setError('Failed to update comment');
        // Revert optimistic update
        setComments(previousComments);
        console.error('Error updating comment:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [comments, currentUserId, isLoading],
  );

  // Like/unlike comment
  const likeComment = useCallback(
    async (commentId: string): Promise<void> => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Optimistic update
        setComments((prev) =>
          updateCommentInTree(prev, commentId, (comment) => {
            const isLiked = comment.reactions?.some(
              (r) => r.userId === currentUserId && r.type === 'like',
            );
            const newReactions = isLiked
              ? comment.reactions?.filter(
                  (r) => !(r.userId === currentUserId && r.type === 'like'),
                ) || []
              : [
                  ...(comment.reactions || []),
                  {
                    id: `temp-${Date.now()}`,
                    type: 'like' as const,
                    userId: currentUserId,
                    commentId,
                    createdAt: new Date().toISOString(),
                  },
                ];

            return {
              ...comment,
              reactions: newReactions,
              _count: {
                reactions: newReactions.length,
                replies: comment._count?.replies || 0,
              },
            };
          }),
        );

        // Make API call
        await mockLikeComment(commentId, currentUserId);
      } catch (err) {
        setError('Failed to like comment');
        // Revert optimistic update would go here
        console.error('Error liking comment:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, isLoading],
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      const previousComments = comments;

      try {
        // Optimistic update
        setComments((prev) => removeCommentFromTree(prev, commentId));

        // Make API call
        await mockDeleteComment(commentId, currentUserId);
      } catch (err) {
        setError('Failed to delete comment');
        // Revert optimistic update
        setComments(previousComments);
        console.error('Error deleting comment:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [comments, currentUserId, isLoading],
  );

  // Load more comments (pagination)
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      // Mock load more logic
      await new Promise((resolve) => setTimeout(resolve, API_DELAY));
      // In real app, load more comments from API
      setHasMore(false); // Mock: no more comments to load
    } catch (err) {
      setError('Failed to load more comments');
      console.error('Error loading more comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Refresh comments
  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock refresh logic
      await new Promise((resolve) => setTimeout(resolve, API_DELAY));
      // In real app, reload comments from API
      setComments(initialComments);
      setHasMore(true);
    } catch (err) {
      setError('Failed to refresh comments');
      console.error('Error refreshing comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [initialComments]);

  return {
    comments,
    isLoading,
    error,
    totalCount,
    hasMore,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    loadMore,
    refresh,
  };
};

export default useComments;
