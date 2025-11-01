'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing video comments
 * Instagram 2025 style: real-time comments, replies, reactions
 */

export interface ReelsComment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  isVerified?: boolean;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  replies?: ReelsComment[];
  repliesCount: number;
  isAuthor?: boolean; // Is video author
  isPinned?: boolean;
}

interface UseReelsCommentsOptions {
  videoId: string;
  initialComments?: ReelsComment[];
  initialCount?: number;
  onAddComment?: (
    videoId: string,
    content: string,
    replyTo?: string,
  ) => Promise<ReelsComment>;
  onLikeComment?: (commentId: string, isLiked: boolean) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onReportComment?: (commentId: string, reason: string) => Promise<void>;
  enableRealtime?: boolean;
}

export const useReelsComments = (options: UseReelsCommentsOptions) => {
  const {
    videoId,
    initialComments = [],
    initialCount = 0,
    onAddComment,
    onLikeComment,
    onDeleteComment,
    onReportComment,
    enableRealtime = true,
  } = options;

  // State management
  const [comments, setComments] = useState<ReelsComment[]>(initialComments);
  const [commentsCount, setCommentsCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  // Refs
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Load more comments (pagination)
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Add comment
  const addComment = useCallback(
    async (content: string, replyToId?: string) => {
      if (!content.trim() || isAddingComment) return;

      // Optimistic update
      const optimisticComment: ReelsComment = {
        id: `temp-${Date.now()}`,
        userId: 'current-user',
        username: 'you',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
        repliesCount: 0,
        isAuthor: false,
      };

      try {
        setIsAddingComment(true);

        if (replyToId) {
          // Add as reply
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === replyToId
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), optimisticComment],
                    repliesCount: comment.repliesCount + 1,
                  }
                : comment,
            ),
          );
        } else {
          // Add as top level comment
          setComments((prev) => [optimisticComment, ...prev]);
          setCommentsCount((prev) => prev + 1);
        }

        // API call
        const newCommentData = await onAddComment?.(
          videoId,
          content,
          replyToId,
        );

        if (newCommentData) {
          // Replace optimistic comment with real data
          if (replyToId) {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === replyToId
                  ? {
                      ...comment,
                      replies:
                        comment.replies?.map((reply) =>
                          reply.id === optimisticComment.id
                            ? newCommentData
                            : reply,
                        ) || [],
                    }
                  : comment,
              ),
            );
          } else {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === optimisticComment.id ? newCommentData : comment,
              ),
            );
          }
        }

        // Clear input
        setNewComment('');
        setReplyingTo(null);
      } catch (error) {
        // Remove optimistic comment on error
        if (replyToId) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === replyToId
                ? {
                    ...comment,
                    replies:
                      comment.replies?.filter(
                        (reply) => reply.id !== optimisticComment.id,
                      ) || [],
                    repliesCount: Math.max(0, comment.repliesCount - 1),
                  }
                : comment,
            ),
          );
        } else {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== optimisticComment.id),
          );
          setCommentsCount((prev) => Math.max(0, prev - 1));
        }
        console.error('Failed to add comment:', error);
      } finally {
        setIsAddingComment(false);
      }
    },
    [isAddingComment, videoId, onAddComment],
  );

  // Like/unlike comment
  const toggleCommentLike = useCallback(
    async (commentId: string, isReply: boolean = false, parentId?: string) => {
      try {
        // Optimistic update
        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === parentId
                ? {
                    ...comment,
                    replies:
                      comment.replies?.map((reply) =>
                        reply.id === commentId
                          ? {
                              ...reply,
                              isLiked: !reply.isLiked,
                              likesCount: reply.isLiked
                                ? reply.likesCount - 1
                                : reply.likesCount + 1,
                            }
                          : reply,
                      ) || [],
                  }
                : comment,
            ),
          );
        } else {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likesCount: comment.isLiked
                      ? comment.likesCount - 1
                      : comment.likesCount + 1,
                  }
                : comment,
            ),
          );
        }

        const comment =
          comments.find((c) => c.id === commentId) ||
          comments
            .flatMap((c) => c.replies || [])
            .find((r) => r.id === commentId);

        if (comment) {
          await onLikeComment?.(commentId, !comment.isLiked);
        }
      } catch (error) {
        // Revert on error
        if (isReply && parentId) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === parentId
                ? {
                    ...comment,
                    replies:
                      comment.replies?.map((reply) =>
                        reply.id === commentId
                          ? {
                              ...reply,
                              isLiked: !reply.isLiked,
                              likesCount: reply.isLiked
                                ? reply.likesCount + 1
                                : reply.likesCount - 1,
                            }
                          : reply,
                      ) || [],
                  }
                : comment,
            ),
          );
        } else {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likesCount: comment.isLiked
                      ? comment.likesCount + 1
                      : comment.likesCount - 1,
                  }
                : comment,
            ),
          );
        }
        console.error('Failed to toggle comment like:', error);
      }
    },
    [comments, onLikeComment],
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string) => {
      const commentToDelete = comments.find((c) => c.id === commentId);

      try {
        // Optimistic update
        if (commentToDelete) {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId),
          );
          setCommentsCount((prev) => Math.max(0, prev - 1));
        }

        await onDeleteComment?.(commentId);
      } catch (error) {
        // Restore comment on error
        if (commentToDelete) {
          setComments((prev) => [commentToDelete, ...prev]);
          setCommentsCount((prev) => prev + 1);
        }
        console.error('Failed to delete comment:', error);
      }
    },
    [comments, onDeleteComment],
  );

  // Start reply
  const startReply = useCallback((commentId: string, username: string) => {
    setReplyingTo(commentId);
    setNewComment(`@${username} `);
    commentInputRef.current?.focus();
  }, []);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setNewComment('');
  }, []);

  // Toggle comments visibility
  const toggleComments = useCallback(() => {
    setShowComments((prev) => !prev);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((content: string) => {
    setNewComment(content);
  }, []);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (newComment.trim()) {
      addComment(newComment, replyingTo || undefined);
    }
  }, [newComment, replyingTo, addComment]);

  // Auto-resize textarea
  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.style.height = 'auto';
      commentInputRef.current.style.height = `${commentInputRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  return {
    // State
    comments,
    commentsCount,
    isLoading,
    isAddingComment,
    newComment,
    replyingTo,
    showComments,
    hasMoreComments,
    loadingMore,

    // Actions
    addComment,
    toggleCommentLike,
    deleteComment,
    startReply,
    cancelReply,
    toggleComments,
    handleInputChange,
    handleSubmit,

    // Refs
    commentInputRef,
    commentsContainerRef,

    // Utilities
    formatTimeAgo: (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d`;
      return `${Math.floor(diffInSeconds / 604800)}w`;
    },
  };
};
