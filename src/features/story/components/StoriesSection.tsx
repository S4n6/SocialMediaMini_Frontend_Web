'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import StoryCard from './StoryCard';

import { Story } from '../types/story';
import { User } from '@/types';

interface StoriesContainerProps {
  stories: Story[];
  currentUser?: User;
  onStoryClick?: (storyId: string) => void;
  onAddStoryClick?: () => void;
}

export function StoriesSection({
  stories,
  currentUser,
  onStoryClick,
  onAddStoryClick,
}: StoriesContainerProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    // Each story is 80px width + 12px gap = 92px per story
    const storyWidth = 92;
    const storiesPerScroll = 6; // Scroll exactly 6 stories at a time
    const scrollAmount = storyWidth * storiesPerScroll;

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const updateScrollButtons = () => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10,
    );
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener('scroll', handleScroll);
    updateScrollButtons();

    // Update on resize
    const handleResize = () => {
      updateScrollButtons();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [stories.length]);

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* Left Navigation Button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollCarousel('left')}
          className="absolute top-1/2 left-2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/95 p-2 opacity-100 shadow-lg backdrop-blur-sm transition-opacity duration-150 hover:opacity-90 dark:bg-gray-800/95"
          aria-label="Scroll stories left"
        >
          <FaChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Right Navigation Button */}
      {canScrollRight && (
        <button
          onClick={() => scrollCarousel('right')}
          className="absolute top-1/2 right-2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/95 p-2 opacity-100 shadow-lg backdrop-blur-sm transition-opacity duration-150 hover:opacity-90 dark:bg-gray-800/95"
          aria-label="Scroll stories right"
        >
          <FaChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Stories Container */}
      <div
        ref={carouselRef}
        className="w-full overflow-x-auto scroll-smooth px-4 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          className="grid grid-flow-col items-center justify-start gap-4"
          style={{
            gridTemplateColumns: `repeat(${(currentUser ? 1 : 0) + stories.length}, 80px)`,
            width: 'max-content',
          }}
        >
          {/* Add Story Card (if current user exists) */}
          {currentUser && (
            <div>
              <StoryCard
                id={`add-story-${currentUser.id}`}
                user={{
                  id: currentUser?.id || '',
                  name: currentUser?.fullName || '',
                  username: currentUser?.userName || '',
                  avatar: currentUser?.avatar || undefined,
                }}
                storyImage={currentUser.avatar || '/default-avatar.png'}
                isViewed={false}
                isAddStory={true}
                onClick={onAddStoryClick}
              />
            </div>
          )}

          {/* Story Cards */}
          {stories.map((story) => (
            <div key={story.id}>
              <StoryCard
                id={story.id}
                user={story.user}
                storyImage={story.mediaUrl}
                isViewed={story.isViewed || false}
                onClick={() => onStoryClick?.(story.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
