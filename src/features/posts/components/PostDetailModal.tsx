'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, MoreHorizontal } from 'lucide-react';
import { FaComment, FaShare, FaBookmark } from 'react-icons/fa';
import type { LegacyPost as Post } from '@/types';
import PostReactions from './interactions/PostReactions';
import { usePostReactions } from '../hooks/usePostReactions';
import {
  CommentsList,
  CommentInput,
  useComments,
  Comment,
} from '@/features/comments';
import { LoadingState, ErrorState } from '@/components/shared/States';

interface PostDetailModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (post: Post) => void;
}

// Mock comments data for now
const mockComments = [
  {
    id: '1',
    user: {
      id: 'user1',
      username: 'vianamylene',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150',
      fullName: 'Mylene Viana',
    },
    content: '👍👍👍👍👍',
    timestamp: '22 giờ',
    likes: 2,
    isLiked: false,
    replies: [],
  },
  {
    id: '2',
    user: {
      id: 'user2',
      username: 'gabimacullo',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      fullName: 'Gabi Macullo',
    },
    content: '❤️',
    timestamp: '17 giờ',
    likes: 54,
    isLiked: false,
    replies: [],
  },
  {
    id: '3',
    user: {
      id: 'user3',
      username: 'seck_lhe_microbe',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      fullName: 'Seck',
    },
    content: '🔥🔥',
    timestamp: '10 giờ',
    likes: 0,
    isLiked: false,
    replies: [],
  },
];

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { reactions, userReaction, totalCount, toggleReaction } =
    usePostReactions({
      postId: post.id.toString(),
      initialReactions: [],
    });

  // Transform mock comments to new Comment format
  const transformedComments: Comment[] = mockComments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    authorId: comment.user.id,
    postId: post.id.toString(),
    author: {
      id: comment.user.id,
      username: comment.user.username,
      fullName: comment.user.fullName,
      avatar: comment.user.avatar,
    },
    replies: [],
    reactions: [],
    createdAt: comment.timestamp,
    updatedAt: comment.timestamp,
    _count: {
      reactions: comment.likes,
      replies: 0,
    },
  }));

  const {
    comments,
    addComment,
    likeComment,
    deleteComment,
    updateComment,
    totalCount: commentsCount,
    isLoading: commentsLoading,
    error: commentsError,
    refresh: refreshComments,
  } = useComments({
    postId: post.id.toString(),
    initialComments: transformedComments,
  });

  const handleReactionChange = (reactionType: any) => {
    toggleReaction(reactionType);
    if (onUpdate) {
      onUpdate({
        ...post,
        isLiked: !!userReaction,
        likes: totalCount,
      });
    }
  };

  // Get the main image from post
  const mainImage = post.images?.[0]?.imageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] md:h-[90vh] p-0 overflow-hidden bg-white">
        {/* Mobile responsive adjustments */}
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex h-full flex-col md:flex-row">
          {/* Left Panel - Image */}
          <div className="flex-1 bg-black flex items-center justify-center md:max-w-[60%]">
            {mainImage ? (
              <img
                src={mainImage}
                alt="Post content"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/60 text-center">
                <div className="text-lg mb-2">📷</div>
                <div>No image available</div>
              </div>
            )}
          </div>

          {/* Right Panel - Comments & Actions */}
          <div className="w-full md:w-96 bg-white flex flex-col border-l-0 md:border-l border-gray-200 max-h-[40vh] md:max-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.fullName.toString().charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {post.author.username}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Post Caption */}
            {post.content && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.fullName.toString().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-semibold text-sm mr-2">
                      {post.author.username}
                    </span>
                    <span className="text-sm">{post.content}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {post.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4">
              {commentsError ? (
                <ErrorState
                  message={commentsError}
                  onRetry={refreshComments}
                  size="sm"
                />
              ) : commentsLoading && comments.length === 0 ? (
                <LoadingState text="Đang tải bình luận..." size="sm" />
              ) : (
                <CommentsList
                  postId={post.id.toString()}
                  comments={comments}
                  onAddComment={addComment}
                  onLikeComment={likeComment}
                  onDeleteComment={deleteComment}
                  onEditComment={updateComment}
                  showInput={false}
                />
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-4 border-t border-gray-200">
              {/* Like, Comment, Share buttons */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <PostReactions
                    postId={post.id.toString()}
                    reactions={reactions}
                    userReaction={userReaction}
                    totalCount={totalCount}
                    onReact={handleReactionChange}
                    onRemoveReaction={() => handleReactionChange(null)}
                    showPicker={false}
                    className="p-0"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 text-muted-foreground hover:text-gray-700"
                  >
                    <FaComment className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 text-muted-foreground hover:text-gray-700"
                  >
                    <FaShare className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-muted-foreground hover:text-gray-700"
                >
                  <FaBookmark className="w-5 h-5" />
                </Button>
              </div>

              {/* Likes count */}
              <div className="text-sm font-semibold mb-2">
                {totalCount || post.likes} lượt thích
              </div>

              <div className="text-xs text-gray-500 mb-3">1 ngày trước</div>

              {/* Comment Input */}
              <div className="pt-3 border-t border-gray-100">
                <CommentInput
                  placeholder="Bình luận..."
                  onSubmit={(content: string) => addComment(content)}
                  size="sm"
                  disabled={commentsLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
