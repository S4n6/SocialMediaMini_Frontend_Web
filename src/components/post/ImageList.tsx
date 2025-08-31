"use client";

import React, { useState } from "react";
import { FaHeart, FaComment, FaPlay } from "react-icons/fa";
import { Card } from "@/components/ui/card";

/**
 * Interface for individual image/post items
 */
export interface ImageItem {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isVideo?: boolean;
  caption?: string;
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
}

/**
 * Props for ImageList component
 */
interface ImageListProps {
  /** Array of images/posts to display */
  images: ImageItem[];
  /** Number of columns in the grid */
  columns?: number;
  /** Gap between grid items */
  gap?: number;
  /** Whether to show hover overlay with stats */
  showOverlay?: boolean;
  /** Handler for image click */
  onImageClick?: (image: ImageItem) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom title for the image list */
  title?: string;
}

/**
 * Instagram-style image grid component
 * Displays images in a responsive grid with hover effects and stats
 */
export default function ImageList({
  images = [],
  columns = 3,
  gap = 1,
  showOverlay = true,
  onImageClick,
  isLoading = false,
  title = "Posts",
}: ImageListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  /**
   * Handle image click interaction
   */
  const handleImageClick = (image: ImageItem) => {
    onImageClick?.(image);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            {title}
          </h3>
        )}
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap * 0.25}rem`,
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md opacity-60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center text-gray-600 dark:text-gray-400">
        <h3 className="text-lg font-semibold">No posts yet</h3>
        <p className="text-sm">Share your first photo to get started!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Image Grid */}
      <div
        className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-3"
        style={{
          gap: `${gap * 0.25}rem`,
        }}
      >
        {images.map((image) => (
          <Card
            key={image.id}
            className="relative aspect-square overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => handleImageClick(image)}
            onMouseEnter={() => setHoveredItem(image.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Main Image */}
            <div className="relative w-full h-full">
              <img
                src={image.imageUrl}
                alt={image.caption || `Post by ${image.author?.name || "User"}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Video Indicator */}
              {image.isVideo && (
                <div className="absolute top-2 right-2 p-1 bg-black/70 rounded-sm">
                  <FaPlay className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Hover Overlay */}
              {showOverlay && hoveredItem === image.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200">
                  <div className="flex items-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <FaHeart className="w-5 h-5" />
                      <span className="font-bold text-sm">
                        {image.likes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaComment className="w-5 h-5" />
                      <span className="font-bold text-sm">
                        {image.comments.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Indicator */}
      {images.length > 0 && images.length % (columns * 3) === 0 && (
        <div className="flex justify-center mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {images.length} posts
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton component for loading state
 */
export function ImageListSkeleton({
  columns = 3,
  gap = 1,
  count = 9,
}: {
  columns?: number;
  gap?: number;
  count?: number;
}) {
  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
export function ImageListEmpty({
  title = "No posts yet",
  description = "Share your first photo to get started!",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center text-gray-600 dark:text-gray-400">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}

/**
 * Export types for external use
 */
export type { ImageListProps };
