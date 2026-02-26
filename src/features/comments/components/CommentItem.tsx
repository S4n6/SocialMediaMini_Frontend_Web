'use client';

import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentItemProps, Comment } from '../types';

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  level = 0,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    onLike?.();
    // Simulate API delay
    setTimeout(() => setIsLiking(false), 300);
  };

  // Format timestamp to Vietnamese style
  const formatTimestamp = (timestamp: string) => {
    // For now, return as is. In real app, you'd format properly
    return timestamp;
  };

  // Calculate indentation based on nesting level
  const maxDepth = 3;
  const actualLevel = Math.min(level, maxDepth);
  const indentClass = actualLevel > 0 ? `ml-${actualLevel * 4}` : '';

  return (
    <div
      className={cn('group', indentClass, className)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Username and content */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-gray-900">
                  {comment.author.username}
                </span>
                <span className="text-sm text-gray-900 break-words">
                  {comment.content}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(comment.createdAt)}
                </span>

                {comment.likesCount > 0 && (
                  <span className="text-xs text-gray-500 font-medium">
                    {comment.likesCount} lượt thích
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReply}
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto font-medium"
                >
                  Trả lời
                </Button>

                {/* More actions (visible on hover) */}
                {showActions && (
                  <div className="flex items-center gap-1">
                    {comment.canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="text-xs text-gray-400 hover:text-gray-600 p-0 h-auto"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}

                    {comment.canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-xs text-gray-400 hover:text-red-600 p-0 h-auto"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-400 hover:text-gray-600 p-0 h-auto"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Like button */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  'p-1 h-auto transition-colors',
                  comment.isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500',
                )}
              >
                <Heart
                  className={cn(
                    'w-3 h-3 transition-all',
                    comment.isLiked && 'fill-current',
                    isLiking && 'scale-110',
                  )}
                />
              </Button>

              {/* Show like count if > 0 */}
              {comment.likesCount > 0 && (
                <span className="text-xs text-gray-400 min-w-[20px] text-center">
                  {comment.likesCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
