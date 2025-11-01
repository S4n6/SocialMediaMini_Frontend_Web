'use client';

import React, { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { CommentsListProps, Comment, CommentWithDetails } from '../types';

export const CommentsList: React.FC<CommentsListProps> = ({
  postId,
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  onEditComment,
  className = '',
  showInput = true,
  maxDepth = 3,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);

  const handleAddComment = (content: string, parentId?: string) => {
    if (content.trim()) {
      onAddComment?.(content, parentId);
      setReplyingTo(null);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setEditingComment(null);
  };

  const handleEdit = (commentId: string) => {
    setEditingComment(editingComment === commentId ? null : commentId);
    setReplyingTo(null);
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    if (content.trim()) {
      onEditComment?.(commentId, content);
      setEditingComment(null);
    }
  };

  // Convert Comment to CommentWithDetails for display
  const transformComment = (
    comment: Comment,
    currentUserId: string = 'current-user',
  ): CommentWithDetails => {
    const likesCount = comment._count?.reactions || 0;
    const repliesCount =
      comment._count?.replies || comment.replies?.length || 0;

    return {
      ...comment,
      isLiked:
        comment.reactions?.some(
          (r) => r.userId === currentUserId && r.type === 'like',
        ) || false,
      likesCount,
      repliesCount,
      canEdit: comment.authorId === currentUserId,
      canDelete: comment.authorId === currentUserId,
    };
  };

  // Render comments with nested replies
  const renderComment = (
    comment: Comment,
    level: number = 0,
  ): React.ReactNode => {
    const commentWithDetails = transformComment(comment);
    const isReplying = replyingTo === comment.id;
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className={level > 0 ? 'mt-3' : 'mt-4'}>
        {!isEditing ? (
          <CommentItem
            comment={commentWithDetails}
            onLike={() => onLikeComment?.(comment.id)}
            onReply={() => handleReply(comment.id)}
            onEdit={() => handleEdit(comment.id)}
            onDelete={() => onDeleteComment?.(comment.id)}
            level={level}
          />
        ) : (
          <div
            className={level > 0 ? `ml-${Math.min(level, maxDepth) * 4}` : ''}
          >
            <CommentInput
              placeholder="Chỉnh sửa bình luận..."
              onSubmit={(content) => handleUpdateComment(comment.id, content)}
              onCancel={() => setEditingComment(null)}
              autoFocus
              size="sm"
            />
          </div>
        )}

        {/* Reply input */}
        {isReplying && level < maxDepth && (
          <div
            className={`mt-2 ${level > 0 ? `ml-${Math.min(level + 1, maxDepth) * 4}` : 'ml-11'}`}
          >
            <CommentInput
              placeholder={`Trả lời ${comment.author.username}...`}
              onSubmit={(content) => handleAddComment(content, comment.id)}
              onCancel={() => setReplyingTo(null)}
              autoFocus
              size="sm"
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && level < maxDepth && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}

        {/* Show "View more replies" if replies are truncated due to depth limit */}
        {comment.replies && comment.replies.length > 0 && level >= maxDepth && (
          <div className={`mt-2 ml-${Math.min(level, maxDepth) * 4}`}>
            <button className="text-xs text-gray-500 hover:text-gray-700">
              Xem thêm {comment.replies.length} phản hồi
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main comment input */}
      {showInput && (
        <div className="mb-6">
          <CommentInput
            placeholder="Viết bình luận..."
            onSubmit={(content) => handleAddComment(content)}
            size="md"
          />
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm">Chưa có bình luận nào</p>
            <p className="text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsList;
