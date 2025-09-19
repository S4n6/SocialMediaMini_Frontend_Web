"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import StoryCard from "@/components/story/StoryCard";

interface StoriesContainerProps {
  stories: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
    storyImage?: string;
    isViewed?: boolean;
  }>;
  currentUser?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
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

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    // Each story is 80px width + 12px gap = 92px per story
    const storyWidth = 92;
    const storiesPerScroll = 6; // Scroll exactly 6 stories at a time
    const scrollAmount = storyWidth * storiesPerScroll;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const updateScrollButtons = () => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
    };

    container.addEventListener("scroll", handleScroll);
    updateScrollButtons();

    // Update on resize
    const handleResize = () => {
      updateScrollButtons();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [stories.length]);

  return (
    <div className="relative group w-full max-w-[600px] mx-auto">
      {/* Left Navigation Button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollCarousel("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <FaChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Right Navigation Button */}
      {canScrollRight && (
        <button
          onClick={() => scrollCarousel("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <FaChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Stories Container */}
      <div
        ref={carouselRef}
        className="w-full overflow-x-auto px-4 py-2 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="grid grid-flow-col gap-3 justify-start items-center"
          style={{
            gridTemplateColumns: `repeat(${
              (currentUser ? 1 : 0) + stories.length
            }, 80px)`,
            width: "max-content",
          }}
        >
          {/* Add Story Card (if current user exists) */}
          {currentUser && (
            <div>
              <StoryCard
                id={`add-story-${currentUser.id}`}
                user={currentUser}
                storyImage={currentUser.avatar || "/default-avatar.png"}
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
                storyImage={story.storyImage || "/default-story.png"}
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
