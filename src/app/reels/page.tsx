'use client';

import React from 'react';
import { ReelsFeed } from '@/features/reels/components/ReelsFeed';
import { Metadata } from 'next';

/**
 * Reels page component - Instagram 2025 style vertical video feed
 * Features: Full-screen videos, vertical scrolling, auto-play, infinite loading
 *
 * Design: Black background, edge-to-edge videos, floating UI elements
 * UX: Snap scrolling, gesture controls, keyboard shortcuts support
 */
export default function ReelsPage(): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Full-screen video feed container */}
      <main className="h-full w-full">
        <ReelsFeed />
      </main>

      {/* Global styles for reels page */}
      <style jsx global>{`
        /* Hide scrollbars but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scrolling for reels */
        .reels-scroll {
          scroll-behavior: smooth;
          scroll-snap-type: y mandatory;
        }

        /* Prevent overscroll on mobile */
        body {
          overscroll-behavior: none;
        }

        /* Video container snap alignment */
        .reel-item {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        /* Prevent text selection on video controls */
        .video-controls {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Custom focus styles for accessibility */
        .reels-button:focus {
          outline: 2px solid rgba(255, 255, 255, 0.8);
          outline-offset: 2px;
        }

        /* Animation for like heart */
        @keyframes heartPop {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(-10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .heart-animation {
          animation: heartPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Smooth transitions for all interactive elements */
        .reels-transition {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Backdrop blur for iOS Safari */
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* Loading shimmer effect */
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0)
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Video quality indicator */
        .quality-indicator {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Progress bar styling */
        .progress-bar {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(
            90deg,
            #ff6b6b,
            #ffd93d,
            #6bcf7f,
            #4d96ff
          );
          background-size: 400% 100%;
          animation: gradient 3s ease infinite;
          transition: width 0.1s linear;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          /* Prevent zoom on double tap */
          .no-zoom {
            touch-action: manipulation;
          }

          /* Optimize for mobile performance */
          .mobile-optimized {
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
            will-change: transform;
          }
        }

        /* Dark mode optimizations */
        @media (prefers-color-scheme: dark) {
          .reels-shadow {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          }
        }

        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .heart-animation,
          .shimmer,
          .progress-fill {
            animation: none;
          }

          .reels-transition {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
