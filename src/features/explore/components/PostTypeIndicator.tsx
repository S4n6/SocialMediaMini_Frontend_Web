'use client';

import React from 'react';
import { Play, Copy, ShoppingBag, Video, Zap } from 'lucide-react';
import { ExplorePost } from '../types/explore';

interface PostTypeIndicatorProps {
  post: ExplorePost;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PostTypeIndicator: React.FC<PostTypeIndicatorProps> = ({
  post,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconSize = {
    sm: 10,
    md: 14,
    lg: 18,
  };

  const getTypeIndicator = () => {
    const baseClasses = `flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm p-1.5 ${className}`;

    switch (post.mediaType) {
      case 'video':
        return (
          <div className={baseClasses}>
            <Play size={iconSize[size]} className="text-white fill-white" />
          </div>
        );

      case 'carousel':
        return (
          <div className={baseClasses}>
            <Copy size={iconSize[size]} className="text-white" />
          </div>
        );

      default:
        return null;
    }
  };

  const getSpecialIndicators = () => {
    const indicators = [];

    // Sponsored indicator
    if (post.isSponsored) {
      indicators.push(
        <div
          key="sponsored"
          className="flex items-center justify-center rounded-full bg-blue-500 p-1.5"
        >
          <Zap size={iconSize[size]} className="text-white" />
        </div>,
      );
    }

    // Shopping indicator (if product-related)
    if (post.content?.includes('#shop') || post.content?.includes('#product')) {
      indicators.push(
        <div
          key="shopping"
          className="flex items-center justify-center rounded-full bg-green-500 p-1.5"
        >
          <ShoppingBag size={iconSize[size]} className="text-white" />
        </div>,
      );
    }

    // IGTV indicator (long videos)
    if (
      post.mediaType === 'video' &&
      post.viewsCount &&
      post.viewsCount > 10000
    ) {
      indicators.push(
        <div
          key="igtv"
          className="flex items-center justify-center rounded-full bg-purple-500 p-1.5"
        >
          <Video size={iconSize[size]} className="text-white" />
        </div>,
      );
    }

    return indicators;
  };

  const typeIndicator = getTypeIndicator();
  const specialIndicators = getSpecialIndicators();

  if (!typeIndicator && specialIndicators.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      {typeIndicator}
      {specialIndicators}
    </div>
  );
};
