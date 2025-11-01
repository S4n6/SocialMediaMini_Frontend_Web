'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Play,
} from 'lucide-react';
import { ExplorePost } from '../types/explore';
import { Button } from '@/components/ui/button';
import { UserProfilePreview } from './UserProfilePreview';

interface PostPreviewModalProps {
  post: ExplorePost | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPost: (post: ExplorePost) => void;
  onUserClick?: (username: string) => void;
  onFollowUser?: (userId: string) => void;
  onMessageUser?: (userId: string) => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  post,
  isOpen,
  onClose,
  onNavigateToPost,
  onUserClick,
  onFollowUser,
  onMessageUser,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const [showUserPreview, setShowUserPreview] = useState(false);

  useEffect(() => {
    if (post) {
      setCurrentMediaIndex(0);
      setIsLiked(false);
      setIsSaved(false);
      setLikesCount(post.likesCount);
    }
  }, [post]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!post || !isOpen) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share post:', post.id);
  };

  const handleViewFullPost = () => {
    onNavigateToPost(post);
    onClose();
  };

  const handleUserClick = () => {
    setShowUserPreview(true);
  };

  const handleUserProfileView = (username: string) => {
    onUserClick?.(username);
    onClose();
  };

  const handleFollowUser = (userId: string) => {
    onFollowUser?.(userId);
  };

  const handleMessageUser = (userId: string) => {
    onMessageUser?.(userId);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const nextMedia = () => {
    if (post.mediaUrls && currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex((prev) => prev + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Media Section */}
          <div className="relative flex-1 bg-black flex items-center justify-center">
            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={post.mediaUrls[currentMediaIndex]}
                  alt={post.content || 'Post media'}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Media Navigation */}
                {post.mediaUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      disabled={currentMediaIndex === 0}
                      className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextMedia}
                      disabled={currentMediaIndex === post.mediaUrls.length - 1}
                      className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ›
                    </button>

                    {/* Media Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {post.mediaUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentMediaIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Video Play Button */}
                {post.mediaType === 'video' && (
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="p-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                      <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div>No media available</div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-96 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {post.user.avatar ? (
                  <Image
                    src={post.user.avatar}
                    alt={post.user.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUserClick}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {post.user.username}
                    </button>
                    {post.user.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  {post.location && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {post.location.name}
                    </div>
                  )}
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Caption */}
                <div className="text-gray-900 dark:text-white">
                  <span className="font-semibold">{post.user.username}</span>{' '}
                  {post.content}
                </div>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="text-blue-500 hover:text-blue-600 cursor-pointer text-sm"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>{formatCount(likesCount)} likes</div>
                  <div>{formatCount(post.commentsCount)} comments</div>
                  {post.viewsCount && (
                    <div>{formatCount(post.viewsCount)} views</div>
                  )}
                  <div className="text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className="hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={24}
                      className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
                    />
                  </button>
                  <button className="hover:scale-110 transition-transform">
                    <MessageCircle
                      size={24}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="hover:scale-110 transition-transform"
                  >
                    <Share
                      size={24}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  className="hover:scale-110 transition-transform"
                >
                  <Bookmark
                    size={24}
                    className={`${isSaved ? 'fill-current text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  />
                </button>
              </div>

              <Button onClick={handleViewFullPost} className="w-full">
                View Full Post
              </Button>
            </div>
          </div>
        </div>

        {/* User Profile Preview */}
        {showUserPreview && (
          <UserProfilePreview
            user={{
              id: post.user.id,
              username: post.user.username,
              fullName: post.user.fullName,
              avatar: post.user.avatar,
              isVerified: post.user.isVerified || false,
              bio: post.user.bio,
              postsCount: post.user.postsCount || 0,
              followersCount: post.user.followersCount || 0,
              followingCount: post.user.followingCount || 0,
              isFollowing: post.user.isFollowing,
              isPrivate: post.user.isPrivate,
            }}
            isOpen={showUserPreview}
            onClose={() => setShowUserPreview(false)}
            onFollow={handleFollowUser}
            onMessage={handleMessageUser}
            onViewProfile={handleUserProfileView}
          />
        )}
      </div>
    </div>
  );
};
