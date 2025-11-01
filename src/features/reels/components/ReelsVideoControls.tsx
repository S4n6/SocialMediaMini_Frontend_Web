'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReelsVideoPlayerRef } from './ReelsVideoPlayer';

/**
 * Video Controls Overlay - Instagram 2025 style
 * Features: Progress bar, volume control, quality selector, fullscreen
 */

interface ReelsVideoControlsProps {
  playerRef: React.RefObject<ReelsVideoPlayerRef | null>;
  isVisible: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  showProgressBar?: boolean;
  showVolumeControl?: boolean;
  showQualitySelector?: boolean;
  showFullscreenToggle?: boolean;
  className?: string;
}

export const ReelsVideoControls: React.FC<ReelsVideoControlsProps> = ({
  playerRef,
  isVisible,
  onVisibilityChange,
  showProgressBar = true,
  showVolumeControl = true,
  showQualitySelector = false,
  showFullscreenToggle = true,
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update time from player
  useEffect(() => {
    if (!playerRef.current) return;

    const updateTime = () => {
      const current = playerRef.current?.getCurrentTime() || 0;
      const dur = playerRef.current?.getDuration() || 0;
      setCurrentTime(current);
      setDuration(dur);
    };

    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, [playerRef]);

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle progress bar click/drag
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !playerRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      playerRef.current.seek(newTime);
      setCurrentTime(newTime);
    },
    [duration],
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      playerRef.current?.setVolume(newVolume);

      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted],
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    playerRef.current?.toggleMute();
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (isVisible) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        onVisibilityChange?.(false);
      }, 3000);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-30 ${className}`}
      onMouseMove={() => onVisibilityChange?.(true)}
    >
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center gap-3 text-white text-sm">
            {/* Current Time */}
            <span className="font-mono text-xs opacity-80 min-w-[36px]">
              {formatTime(currentTime)}
            </span>

            {/* Progress Bar */}
            <div
              ref={progressBarRef}
              className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group"
              onClick={handleProgressClick}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-white/20 rounded-full" />

              {/* Progress */}
              <div
                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Scrubber */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                style={{
                  left: `${progressPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={() => setIsDragging(true)}
              />
            </div>

            {/* Duration */}
            <span className="font-mono text-xs opacity-80 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        {/* Volume Control */}
        {showVolumeControl && (
          <div className="relative">
            <button
              className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
              onClick={toggleMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {isMuted || volume === 0 ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div
                ref={volumeSliderRef}
                className="absolute top-full right-0 mt-2 w-8 h-24 bg-black/70 rounded-full p-1 backdrop-blur-sm"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <div className="relative h-full">
                  <div className="absolute inset-x-0 top-0 bottom-0 bg-white/30 rounded-full" />
                  <div
                    className="absolute inset-x-0 bottom-0 bg-white rounded-full transition-all duration-100"
                    style={{ height: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rotate-180"
                    style={{ writingMode: 'vertical-lr' as const }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quality Selector */}
        {showQualitySelector && (
          <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-black/70 transition-colors backdrop-blur-sm">
            HD
          </button>
        )}

        {/* Fullscreen Toggle */}
        {showFullscreenToggle && (
          <button
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Center Play/Pause Button (visible only when paused) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <button
          className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200 hover:scale-110 backdrop-blur-sm opacity-0 hover:opacity-100"
          onClick={() => {
            const state = playerRef.current?.getPlaybackState();
            if (state === 'playing') {
              playerRef.current?.pause();
            } else {
              playerRef.current?.play();
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
