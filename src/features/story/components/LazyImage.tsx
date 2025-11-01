'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// Component tối ưu cho lazy loading images
export const LazyImage: React.FC<LazyImageProps> = memo(
  ({
    src,
    alt,
    width,
    height,
    className = '',
    fallbackSrc = '/images/default-story.jpg',
    priority = false,
    onLoad,
    onError,
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(priority); // Load immediately if priority
    const imgRef = useRef<HTMLDivElement>(null);

    // Intersection Observer cho lazy loading
    useEffect(() => {
      if (priority) return; // Skip lazy loading for priority images

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px', // Load image 50px before it's visible
        },
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };

    // Placeholder gradient for Instagram-like skeleton
    const placeholderGradient =
      'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';

    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={width && height ? { width, height } : {}}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: placeholderGradient,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        {/* Image */}
        {isVisible && (
          <Image
            src={hasError ? fallbackSrc : src}
            alt={alt}
            fill={!width || !height}
            width={width}
            height={height}
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-400 text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs">Failed to load</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

LazyImage.displayName = 'LazyImage';

// CSS cho shimmer animation (add to global CSS)
export const imageShimmerCSS = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Hook để preload important images
export const useImagePreloader = (imageSrcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const promises = imageSrcs.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const loaded = await Promise.allSettled(promises);
        const successful = loaded
          .filter((result) => result.status === 'fulfilled')
          .map((result) => (result as PromiseFulfilledResult<string>).value);

        setLoadedImages(new Set(successful));
        console.log(
          `📸 Preloaded ${successful.length}/${imageSrcs.length} images`,
        );
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }
    };

    if (imageSrcs.length > 0) {
      preloadImages();
    }
  }, [imageSrcs]);

  return {
    loadedImages,
    isImageLoaded: (src: string) => loadedImages.has(src),
  };
};
