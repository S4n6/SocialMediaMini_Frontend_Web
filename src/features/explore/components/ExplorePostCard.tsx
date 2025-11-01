'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExplorePost } from '../types/explore';
import { PostPreviewModal } from './PostPreviewModal';
import { useRealtimePost } from '../services/realtimeService';
import {
  Heart,
  MessageCircle,
  Play,
  Copy,
  Eye,
  MapPin,
  Verified,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

interface ExplorePostCardProps {
  post: ExplorePost;
  onClick: (post: ExplorePost) => void;
  height?: number;
  showAdvancedInteractions?: boolean;
  className?: string;
}

export const ExplorePostCard: React.FC<ExplorePostCardProps> = ({
  post,
  onClick,
  height,
  showAdvancedInteractions = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Use realtime service for live updates
  const { stats, toggleLike, toggleSave, recordView } = useRealtimePost(
    post.id,
    {
      likes: post.likesCount,
      saves: 0,
      views: post.viewsCount || 0,
      comments: post.commentsCount,
      isLiked: false,
      isSaved: false,
    },
  );

  // Record view when card becomes visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoaded && !imageError) {
        recordView();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [imageLoaded, imageError, recordView]);

  const handleClick = () => {
    if (showAdvancedInteractions) {
      setShowPreviewModal(true);
    } else {
      onClick(post);
    }
  };

  const handleNavigateToPost = (post: ExplorePost) => {
    onClick(post);
  };

  // Advanced interactions
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open share modal
    console.log('Share post:', post.id);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Navigate to user profile
    console.log('Navigate to user:', post.user.username);
  };

  // Double tap to like (mobile)
  const handleDoubleClick = () => {
    if (!stats?.isLiked) {
      toggleLike();
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getMediaIcon = () => {
    switch (post.mediaType) {
      case 'video':
        return <Play size={14} className="text-white fill-white" />;
      case 'carousel':
        return <Copy size={14} className="text-white" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
      style={{
        aspectRatio: height ? 'auto' : post.aspectRatio,
        height: height ? `${height}px` : 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Post Image */}
      <div className="relative w-full h-full">
        {!imageError ? (
          <Image
            src={
              post.thumbnailUrl ||
              (post.mediaUrls?.[0] ?? '/images/placeholder.jpg')
            }
            alt={post.content ? post.content.substring(0, 100) : 'Post'}
            fill
            className={`
              object-cover transition-all duration-300
              ${isHovered ? 'scale-110' : 'scale-100'}
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-xs">Image not available</div>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>

      {/* Media Type Indicators - Top Right */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {getMediaIcon() && (
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-1.5">
            {getMediaIcon()}
          </div>
        )}
        {post.mediaCount && post.mediaCount > 1 && (
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-white text-xs font-medium">
              {post.mediaCount}
            </span>
          </div>
        )}
      </div>

      {/* Sponsored Tag - Top Left */}
      {post.isSponsored && (
        <div className="absolute top-2 left-2">
          <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Sponsored
          </div>
        </div>
      )}

      {/* User Info - Bottom Left (Visible on hover) */}
      <div
        className={`
        absolute bottom-2 left-2 flex items-center gap-2
        transition-opacity duration-200
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}
      >
        <button
          onClick={handleUserClick}
          className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 hover:bg-black/80 transition-colors"
        >
          {post.user.avatar ? (
            <Image
              src={post.user.avatar}
              alt={post.user.username}
              width={16}
              height={16}
              className="rounded-full"
            />
          ) : (
            <div className="w-4 h-4 bg-gray-400 rounded-full" />
          )}
          <span className="text-white text-xs font-medium">
            {post.user.username}
          </span>
          {post.user.isVerified && (
            <Verified size={10} className="text-blue-400 fill-blue-400" />
          )}
        </button>
      </div>

      {/* Location Tag - Bottom Right (if available) */}
      {post.location && isHovered && (
        <div className="absolute bottom-2 right-2">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <MapPin size={10} className="text-white" />
            <span className="text-white text-xs">{post.location.name}</span>
          </div>
        </div>
      )}

      {/* Hover Overlay with Stats and Advanced Interactions */}
      <div
        className={`
        absolute inset-0 bg-black/50 transition-opacity duration-200
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}
      >
        {showAdvancedInteractions ? (
          // Advanced interactions layout
          <div className="h-full flex flex-col justify-between p-3">
            {/* Top: Action buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  stats?.isSaved
                    ? 'bg-yellow-500/80 text-white'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 3a3 3 0 0 1 3 3v16l-6-4-6 4V6a3 3 0 0 1 3-3h6Z" />
                </svg>
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 12 2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2c0 .552.448 1 1 1" />
                  <path d="M21 12v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3" />
                </svg>
              </button>
            </div>

            {/* Center: Stats */}
            <div className="flex items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-1">
                <Heart
                  size={20}
                  className={`${stats?.isLiked ? 'fill-red-500 text-red-500' : 'fill-white'}`}
                />
                <span className="text-sm font-bold">
                  {formatCount(stats?.likes || 0)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MessageCircle size={20} className="fill-white" />
                <span className="text-sm font-bold">
                  {formatCount(post.commentsCount)}
                </span>
              </div>

              {post.viewsCount && (
                <div className="flex items-center gap-1">
                  <Eye size={20} className="fill-white" />
                  <span className="text-sm font-bold">
                    {formatCount(post.viewsCount)}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom: Like button */}
            <div className="flex justify-center">
              <button
                onClick={handleLike}
                className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                  stats?.isLiked
                    ? 'bg-red-500/80 text-white scale-110'
                    : 'bg-black/60 text-white hover:bg-black/80 hover:scale-105'
                }`}
              >
                <Heart
                  size={20}
                  className={stats?.isLiked ? 'fill-current' : ''}
                />
              </button>
            </div>
          </div>
        ) : (
          // Simple stats layout
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-1">
                <Heart size={20} className="fill-white" />
                <span className="text-sm font-bold">
                  {formatCount(stats?.likes || 0)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MessageCircle size={20} className="fill-white" />
                <span className="text-sm font-bold">
                  {formatCount(post.commentsCount)}
                </span>
              </div>

              {post.viewsCount && (
                <div className="flex items-center gap-1">
                  <Eye size={20} className="fill-white" />
                  <span className="text-sm font-bold">
                    {formatCount(post.viewsCount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pinned Indicator */}
      {post.isPinned && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-yellow-500 text-white p-2 rounded-full">📌</div>
        </div>
      )}

      {/* Preview Modal */}
      <PostPreviewModal
        post={post}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onNavigateToPost={handleNavigateToPost}
        onUserClick={(username) => {
          // TODO: Navigate to user profile
          console.log('Navigate to user:', username);
        }}
        onFollowUser={(userId) => {
          // TODO: Follow/unfollow user
          console.log('Follow user:', userId);
        }}
        onMessageUser={(userId) => {
          // TODO: Open message with user
          console.log('Message user:', userId);
        }}
      />
    </div>
  );
};
