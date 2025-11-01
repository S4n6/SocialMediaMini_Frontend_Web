'use client';

import React, { useState } from 'react';
import { useReelsComments, ReelsComment } from '../hooks/useReelsComments';

/**
 * Comments overlay component - Instagram 2025 style
 * Slide-up modal with comments list and input
 */

interface ReelsCommentsOverlayProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  initialComments?: ReelsComment[];
  initialCount?: number;
  className?: string;
}

export const ReelsCommentsOverlay: React.FC<ReelsCommentsOverlayProps> = ({
  videoId,
  isVisible,
  onClose,
  initialComments = [],
  initialCount = 0,
  className = '',
}) => {
  const {
    comments,
    commentsCount,
    isAddingComment,
    newComment,
    replyingTo,
    toggleCommentLike,
    startReply,
    cancelReply,
    handleInputChange,
    handleSubmit,
    commentInputRef,
    commentsContainerRef,
    formatTimeAgo,
  } = useReelsComments({
    videoId,
    initialComments,
    initialCount,
    onAddComment: async (videoId, content, replyTo) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: `comment-${Date.now()}`,
        userId: 'current-user',
        username: 'you',
        content,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
        repliesCount: 0,
        isAuthor: false,
      };
    },
    onLikeComment: async (commentId, isLiked) => {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 200));
    },
  });

  // Comment item component
  const CommentItem: React.FC<{
    comment: ReelsComment;
    isReply?: boolean;
    parentId?: string;
  }> = ({ comment, isReply = false, parentId }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-2' : 'mb-4'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {comment.userAvatar ? (
          <img
            src={comment.userAvatar}
            alt={comment.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {comment.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white text-sm">
            {comment.username}
          </span>
          {comment.isVerified && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DA1F2">
              <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.57-2.11-9.96-5.02-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.14 2.14 4-.79-.02-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.62-.03-.92-.08.62 1.94 2.42 3.35 4.55 3.39-1.67 1.31-3.77 2.09-6.05 2.09-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55-.88.39-1.83.65-2.82.77z" />
            </svg>
          )}
          {comment.isAuthor && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
              Creator
            </span>
          )}
          <span className="text-gray-400 text-xs">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="text-white text-sm leading-relaxed mb-2">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <button
            onClick={() => toggleCommentLike(comment.id, isReply, parentId)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              className={
                comment.isLiked ? 'fill-red-500 text-red-500' : 'fill-none'
              }
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
          </button>

          {!isReply && (
            <button
              onClick={() => startReply(comment.id, comment.username)}
              className="hover:text-white transition-colors"
            >
              Reply
            </button>
          )}

          {comment.repliesCount > 0 && !isReply && (
            <button className="hover:text-white transition-colors">
              View {comment.repliesCount} replies
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Comments Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">
            Comments {commentsCount > 0 && `(${commentsCount})`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-700">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 p-2 bg-gray-800 rounded">
              <span className="text-gray-400 text-sm">Replying to comment</span>
              <button
                onClick={cancelReply}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">U</span>
            </div>

            {/* Input */}
            <div className="flex-1 relative">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-gray-800 text-white rounded-full px-4 py-2 pr-12 resize-none max-h-20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              {/* Send Button */}
              {newComment.trim() && (
                <button
                  onClick={handleSubmit}
                  disabled={isAddingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isAddingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
