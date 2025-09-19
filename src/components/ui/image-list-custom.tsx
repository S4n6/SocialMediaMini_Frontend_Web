"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

export interface ImageItem {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isVideo?: boolean;
  duration?: string;
  caption?: string;
  author?: {
    name: string;
    username: string;
    avatar?: string;
  };
  isCarousel?: boolean;
  viewCount?: number;
}

interface ImageListProps {
  images: ImageItem[];
  showOverlay?: boolean;
  onImageClick?: (image: ImageItem) => void;
  isLoading?: boolean;
  title?: string;
  displayMode?: "carousel" | "grid";
  columns?: number;
  gap?: number;
}

export default function ImageList({
  images = [],
  onImageClick,
  isLoading = false,
  displayMode = "carousel",
  columns = 3,
  gap = 1,
}: ImageListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (image: ImageItem) => {
    onImageClick?.(image);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const containerWidth = container.clientWidth;
    const gap = 8; // gap-2 = 8px
    const itemWidth = containerWidth - gap; // Đầy đủ một item minus gap

    if (direction === "left") {
      container.scrollBy({ left: -(itemWidth + gap), behavior: "smooth" });
    } else {
      container.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
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

  const goToSlide = (index: number) => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const containerWidth = container.clientWidth;
    const gap = 8; // gap-2 = 8px
    const itemWidth = containerWidth - gap;

    container.scrollTo({ left: (itemWidth + gap) * index, behavior: "smooth" });
    setCurrentIndex(index);
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
      const containerWidth = container.clientWidth;
      const gap = 8; // gap-2 = 8px
      const itemWidth = containerWidth - gap;
      const scrollPosition = container.scrollLeft;
      const newIndex = Math.round(scrollPosition / (itemWidth + gap));
      setCurrentIndex(Math.max(0, Math.min(newIndex, images.length - 1)));
    };

    container.addEventListener("scroll", handleScroll);
    updateScrollButtons();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [images.length]);

  if (isLoading) {
    return <ImageListSkeleton />;
  }

  if (images.length === 0) {
    return <ImageListEmpty />;
  }

  if (displayMode === "grid") {
    const gridCols = `grid-cols-${columns}`;
    const gridGap = `gap-${gap}`;

    return (
      <div className="w-full">
        <div className={`grid ${gridCols} ${gridGap} w-full`}>
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-800"
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.imageUrl}
                alt={image.caption || "Post image"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scrollCarousel("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <FaChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        <div
          ref={carouselRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="relative flex-shrink-0 w-full aspect-square overflow-hidden cursor-pointer group bg-gray-100 dark:bg-gray-800 rounded-lg snap-start"
              style={{ minWidth: "calc(100% - 8px)" }} // Full width minus gap
              onClick={() => handleImageClick(image)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.imageUrl}
                  alt={image.caption || "Post image"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="100vw"
                />

                <div className="absolute top-3 right-3">
                  <div className="flex gap-1 items-center">
                    {image.isCarousel && (
                      <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L9 13h2.5l1.5-2 2 2.5h3L14.5 10z" />
                          <path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
                        </svg>
                      </div>
                    )}

                    {image.isVideo && (
                      <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                        <FaPlay className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {image.isVideo && image.duration && (
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-medium">
                        {image.duration}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 pointer-events-none rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-blue-500 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ImageListSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          style={{ minWidth: "calc(100% - 8px)" }}
        />
      ))}
    </div>
  );
}

export function ImageListEmpty({
  title = "No Posts Yet",
  description = "When you share photos and videos, they will appear on your profile.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-light text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export type { ImageListProps };
