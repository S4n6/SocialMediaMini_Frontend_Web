'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing video controls state and visibility
 * Instagram 2025 style controls behavior
 */

interface UseVideoControlsOptions {
  autoHideDelay?: number;
  showOnInteraction?: boolean;
  persistOnPause?: boolean;
}

export const useVideoControls = (
  playerRef: React.RefObject<any>,
  options: UseVideoControlsOptions = {},
) => {
  const {
    autoHideDelay = 3000,
    showOnInteraction = true,
    persistOnPause = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(0);

  // Clear hide timeout
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Set hide timeout
  const setHideTimeout = useCallback(() => {
    clearHideTimeout();

    if (!persistOnPause || isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }
  }, [autoHideDelay, persistOnPause, isPlaying, clearHideTimeout]);

  // Show controls
  const showControls = useCallback(() => {
    setIsVisible(true);
    lastInteractionRef.current = Date.now();
    setHideTimeout();
  }, [setHideTimeout]);

  // Hide controls
  const hideControls = useCallback(() => {
    setIsVisible(false);
    clearHideTimeout();
  }, [clearHideTimeout]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    if (isVisible) {
      hideControls();
    } else {
      showControls();
    }
  }, [isVisible, showControls, hideControls]);

  // Handle user interaction
  const handleInteraction = useCallback(() => {
    if (showOnInteraction) {
      showControls();
    }
  }, [showOnInteraction, showControls]);

  // Sync with player state
  useEffect(() => {
    if (!playerRef.current) return;

    const updatePlayerState = () => {
      try {
        const state = playerRef.current?.getPlaybackState();
        const current = playerRef.current?.getCurrentTime() || 0;
        const dur = playerRef.current?.getDuration() || 0;

        setIsPlaying(state === 'playing');
        setCurrentTime(current);
        setDuration(dur);
      } catch (error) {
        // Handle cases where player methods aren't available yet
      }
    };

    const interval = setInterval(updatePlayerState, 100);
    return () => clearInterval(interval);
  }, [playerRef]);

  // Handle play/pause state changes
  useEffect(() => {
    if (persistOnPause && !isPlaying) {
      // Keep controls visible when paused
      clearHideTimeout();
    } else if (isPlaying && isVisible) {
      // Set hide timeout when playing
      setHideTimeout();
    }
  }, [isPlaying, isVisible, persistOnPause, clearHideTimeout, setHideTimeout]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, [clearHideTimeout]);

  // Control actions
  const seekTo = useCallback((time: number) => {
    playerRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  const setVolumeLevel = useCallback(
    (vol: number) => {
      setVolume(vol);
      playerRef.current?.setVolume(vol);

      if (vol === 0) {
        setIsMuted(true);
      } else if (isMuted && vol > 0) {
        setIsMuted(false);
      }
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    playerRef.current?.toggleMute();
    setIsMuted(!isMuted);
  }, [isMuted]);

  const togglePlayPause = useCallback(async () => {
    const state = playerRef.current?.getPlaybackState();
    if (state === 'playing') {
      playerRef.current?.pause();
    } else {
      await playerRef.current?.play();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return {
    // State
    isVisible,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    buffered,
    isFullscreen,

    // Actions
    showControls,
    hideControls,
    toggleControls,
    handleInteraction,
    seekTo,
    setVolumeLevel,
    toggleMute,
    togglePlayPause,
    toggleFullscreen,

    // Utilities
    progressPercent: duration > 0 ? (currentTime / duration) * 100 : 0,
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  };
};
