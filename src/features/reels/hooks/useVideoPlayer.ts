'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ReelsPlaybackState } from '../types/reels';
import { REELS_CONFIG } from '../constants/reels.constants';

/**
 * Custom hook for managing video player state
 * Features: Playback control, volume management, progress tracking
 *
 * This hook provides a clean interface for video player management
 * and can be shared across different video components
 */

export interface UseVideoPlayerOptions {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
}

export interface UseVideoPlayerReturn {
  // State
  playbackState: ReelsPlaybackState;
  currentTime: number;
  duration: number;
  progress: number; // 0-100
  volume: number;
  isMuted: boolean;
  buffered: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;

  // Actions
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  seek: (time: number) => void;
  seekToPercent: (percent: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  reset: () => void;

  // Event handlers for video element
  videoHandlers: {
    onLoadStart: () => void;
    onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
    onLoadedData: () => void;
    onCanPlay: () => void;
    onPlay: () => void;
    onPause: () => void;
    onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
    onProgress: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
    onEnded: () => void;
    onError: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
    onWaiting: () => void;
  };

  // Ref for video element
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const useVideoPlayer = (
  options: UseVideoPlayerOptions = {},
): UseVideoPlayerReturn => {
  const {
    autoPlay = false,
    loop = true,
    muted = true,
    volume: initialVolume = 1,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onError,
  } = options;

  const videoRef = useRef<HTMLVideoElement>(null);

  // State management
  const [playbackState, setPlaybackState] =
    useState<ReelsPlaybackState>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(muted);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived state
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Play function
  const play = useCallback(async (): Promise<void> => {
    if (!videoRef.current || hasError) return;

    try {
      setPlaybackState('loading');
      await videoRef.current.play();
      setPlaybackState('playing');
      onPlay?.();
    } catch (error) {
      console.error('Play failed:', error);
      setPlaybackState('error');
      setHasError(true);
      setErrorMessage('Failed to play video');
      onError?.('Failed to play video');
    }
  }, [hasError, onPlay, onError]);

  // Pause function
  const pause = useCallback((): void => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    setPlaybackState('paused');
    onPause?.();
  }, [onPause]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async (): Promise<void> => {
    if (playbackState === 'playing') {
      pause();
    } else if (playbackState === 'paused' || playbackState === 'idle') {
      await play();
    }
  }, [playbackState, play, pause]);

  // Seek to specific time
  const seek = useCallback(
    (time: number): void => {
      if (!videoRef.current) return;

      const clampedTime = Math.max(0, Math.min(duration, time));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    },
    [duration],
  );

  // Seek to percentage
  const seekToPercent = useCallback(
    (percent: number): void => {
      if (duration > 0) {
        const time = (percent / 100) * duration;
        seek(time);
      }
    },
    [duration, seek],
  );

  // Set volume
  const setVolume = useCallback((vol: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    setVolumeState(clampedVolume);

    if (videoRef.current) {
      videoRef.current.volume = clampedVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback((): void => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  }, [isMuted]);

  // Reset all state
  const reset = useCallback((): void => {
    setPlaybackState('idle');
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setIsLoading(false);
    setHasError(false);
    setErrorMessage(null);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, []);

  // Video event handlers
  const videoHandlers = {
    onLoadStart: useCallback(() => {
      setIsLoading(true);
      setPlaybackState('loading');
      setHasError(false);
      setErrorMessage(null);
    }, []),

    onLoadedMetadata: useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        setDuration(video.duration);
      },
      [],
    ),

    onLoadedData: useCallback(() => {
      setIsLoading(false);
      setPlaybackState('idle');
    }, []),

    onCanPlay: useCallback(() => {
      setIsLoading(false);
      if (playbackState === 'loading') {
        setPlaybackState('playing');
      }
    }, [playbackState]),

    onPlay: useCallback(() => {
      setPlaybackState('playing');
      onPlay?.();
    }, [onPlay]),

    onPause: useCallback(() => {
      setPlaybackState('paused');
      onPause?.();
    }, [onPause]),

    onTimeUpdate: useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        const time = video.currentTime;
        const dur = video.duration || 0;

        setCurrentTime(time);
        onTimeUpdate?.(time, dur);
      },
      [onTimeUpdate],
    ),

    onProgress: useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration || 0;
        const bufferedPercent =
          duration > 0 ? (bufferedEnd / duration) * 100 : 0;
        setBuffered(bufferedPercent);
      }
    }, []),

    onEnded: useCallback(() => {
      setPlaybackState('ended');
      if (loop && videoRef.current) {
        videoRef.current.currentTime = 0;
        play();
      }
      onEnded?.();
    }, [loop, play, onEnded]),

    onError: useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        const error = video.error;

        let errorMsg = 'Video playback error';
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMsg = 'Video loading aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMsg = 'Network error occurred';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMsg = 'Video decoding failed';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMsg = 'Video format not supported';
              break;
          }
        }

        setPlaybackState('error');
        setHasError(true);
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
      },
      [onError],
    ),

    onWaiting: useCallback(() => {
      if (playbackState === 'playing') {
        setPlaybackState('loading');
      }
    }, [playbackState]),
  };

  // Initialize video element when ref changes
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;
      video.volume = volume;
      video.loop = loop;
    }
  }, [isMuted, volume, loop]);

  return {
    // State
    playbackState,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    buffered,
    isLoading,
    hasError,
    errorMessage,

    // Actions
    play,
    pause,
    togglePlayPause,
    seek,
    seekToPercent,
    setVolume,
    toggleMute,
    reset,

    // Event handlers
    videoHandlers,

    // Ref
    videoRef,
  };
};

// Additional hook for managing multiple video players (useful for preloading)
export interface UseVideoPlaylistOptions {
  videos: Array<{ id: string; url: string }>;
  currentIndex: number;
  preloadCount?: number;
}

export const useVideoPlaylist = (options: UseVideoPlaylistOptions) => {
  const {
    videos,
    currentIndex,
    preloadCount = REELS_CONFIG.PLAYBACK.PRELOAD_COUNT,
  } = options;

  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Calculate which videos should be preloaded
  const getPreloadRange = useCallback(() => {
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(videos.length - 1, currentIndex + preloadCount);

    return videos.slice(start, end + 1);
  }, [videos, currentIndex, preloadCount]);

  // Mark video as loaded
  const markVideoLoaded = useCallback((videoId: string) => {
    setLoadedVideos((prev) => new Set([...prev, videoId]));
  }, []);

  // Check if video is loaded
  const isVideoLoaded = useCallback(
    (videoId: string) => {
      return loadedVideos.has(videoId);
    },
    [loadedVideos],
  );

  // Set playing video
  const setPlayingVideo = useCallback((videoId: string | null) => {
    setPlayingVideoId(videoId);
  }, []);

  return {
    preloadRange: getPreloadRange(),
    loadedVideos,
    playingVideoId,
    markVideoLoaded,
    isVideoLoaded,
    setPlayingVideo,
  };
};
