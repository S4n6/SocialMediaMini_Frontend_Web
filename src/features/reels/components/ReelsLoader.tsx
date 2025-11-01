'use client';

import React from 'react';

/**
 * Reels loading component - Instagram 2025 style
 * Features: Smooth loading animation, realistic skeleton, dark theme
 */

interface ReelsLoaderProps {
  className?: string;
}

export const ReelsLoader: React.FC<ReelsLoaderProps> = ({ className = '' }) => {
  return (
    <div
      className={`h-screen w-full bg-black flex items-center justify-center ${className}`}
    >
      {/* Main loader container */}
      <div className="relative w-full max-w-sm h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Skeleton video placeholder */}
        <div className="absolute inset-0 bg-gray-800 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
        </div>

        {/* Top navigation skeleton */}
        <div className="absolute top-4 left-3 right-3 flex items-center justify-between z-20">
          <div className="w-16 h-6 bg-gray-700 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Right side actions skeleton */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-6 z-20">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse border-2 border-gray-600" />

          {/* Action buttons skeleton */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
              <div className="w-8 h-3 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}

          {/* Music disc skeleton */}
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin-slow flex items-center justify-center">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom content skeleton */}
        <div className="absolute left-3 right-20 bottom-6 z-20">
          {/* User info skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-3">
            <div className="w-full h-3 bg-gray-700 rounded animate-pulse" />
            <div className="w-4/5 h-3 bg-gray-700 rounded animate-pulse" />
            <div className="w-3/5 h-3 bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Music info skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded animate-pulse" />
            <div className="w-32 h-3 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Center loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning loader */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-gray-700 border-b-gray-400 rounded-full animate-spin-reverse" />
            </div>

            {/* Loading text */}
            <div className="text-white text-sm font-medium opacity-80">
              Loading Reels...
            </div>

            {/* Dots animation */}
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-30">
          <div className="h-full w-1/3 bg-white animate-pulse" />
        </div>

        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent shimmer" />
        </div>
      </div>

      {/* Additional CSS for custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer {
          animation: shimmer 2s infinite;
        }

        /* Pulsing effect for skeleton elements */
        @keyframes skeleton-pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: skeleton-pulse 2s ease-in-out infinite;
        }

        /* Bouncing dots */
        @keyframes bounce-dot {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        .animate-bounce {
          animation: bounce-dot 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
