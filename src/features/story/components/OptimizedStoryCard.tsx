'use client';

import React, { memo, useMemo } from 'react';
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa';

interface StoryCardProps {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  storyImage: string;
  isViewed: boolean;
  isAddStory?: boolean;
  onClick?: () => void;
}

// Memoized StoryCard để tránh re-render không cần thiết
const StoryCard: React.FC<StoryCardProps> = memo(
  ({ user, storyImage, isViewed, isAddStory = false, onClick }) => {
    // Memoize computed styles để tránh recalculate mỗi render
    const borderStyle = useMemo(
      () => ({
        background: isViewed
          ? 'linear-gradient(45deg, #ccc, #999)'
          : 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
      }),
      [isViewed],
    );

    const displayName = useMemo(() => {
      return user.name.length > 10 ? `${user.name.slice(0, 10)}...` : user.name;
    }, [user.name]);

    return (
      <div
        className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 min-w-[80px]"
        onClick={onClick}
      >
        {/* Story Ring/Border */}
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5"
          style={borderStyle}
        >
          <div className="w-full h-full rounded-full bg-white p-0.5">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200">
              {isAddStory ? (
                // Add Story Button
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FaPlus className="text-gray-600 text-lg" />
                </div>
              ) : (
                // Story Image with lazy loading
                <Image
                  src={storyImage}
                  alt={`${user.name}'s story`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              )}
            </div>
          </div>
        </div>

        {/* Username */}
        <span className="text-xs text-center font-medium text-gray-700 max-w-[80px]">
          {isAddStory ? 'Your story' : displayName}
        </span>
      </div>
    );
  },
);

// Set display name for debugging
StoryCard.displayName = 'StoryCard';

export default StoryCard;
