'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ReelsVideo, ReelsPlaybackState } from '../types/reels';
import { REELS_CONFIG, REELS_ERRORS } from '../constants/reels.constants';

/**
 * Professional video player component - Instagram 2025 style
 * Features: Auto-play, loading states, error handling, performance optimization
 *
 * Design principles:
 * - Seamless playback experience
 * - Intelligent loading and buffering
 * - Robust error handling and recovery
 * - Performance optimized for mobile
 * - Accessibility compliant
 */

export interface ReelsVideoPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlaybackState: () => ReelsPlaybackState;
  getVideoElement: () => HTMLVideoElement | null;
}

interface ReelsVideoPlayerProps {
  video: ReelsVideo;
  isActive: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: string) => void;
  onProgress?: (buffered: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ReelsVideoPlayer = forwardRef<
  ReelsVideoPlayerRef,
  ReelsVideoPlayerProps
>(
  (
    {
      video,
      isActive,
      autoPlay = true,
      muted = true,
      loop = true,
      preload = 'metadata',
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onLoadStart,
      onLoadedData,
      onError,
      onProgress,
      className = '',
      style,
    },
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playbackState, setPlaybackState] =
      useState<ReelsPlaybackState>('idle');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(muted);
    const [buffered, setBuffered] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [currentQuality, setCurrentQuality] = useState<string>('auto');

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [canPlay, setCanPlay] = useState(false);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

    // Performance tracking
    const playAttemptTimeRef = useRef<number>(0);
    const loadStartTimeRef = useRef<number>(0);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          await handlePlay();
        },
        pause: () => {
          handlePause();
        },
        seek: (time: number) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        },
        setVolume: (vol: number) => {
          setVolumeInternal(vol);
        },
        toggleMute: () => {
          toggleMute();
        },
        getCurrentTime: () => currentTime,
        getDuration: () => duration,
        getPlaybackState: () => playbackState,
        getVideoElement: () => videoRef.current,
      }),
      [currentTime, duration, playbackState],
    );

    // Auto-play when video becomes active
    useEffect(() => {
      if (isActive && autoPlay && canPlay && !hasError) {
        const timer = setTimeout(() => {
          handlePlay();
        }, REELS_CONFIG.PLAYBACK.AUTO_PLAY_DELAY);

        return () => clearTimeout(timer);
      } else if (!isActive && playbackState === 'playing') {
        handlePause();
      }
    }, [isActive, autoPlay, canPlay, hasError]);

    // Handle play action
    const handlePlay = useCallback(async () => {
      if (!videoRef.current || hasError) return;

      try {
        setPlaybackState('loading');
        playAttemptTimeRef.current = Date.now();

        await videoRef.current.play();

        setPlaybackState('playing');
        setHasStartedPlaying(true);
        onPlay?.();

        // Track performance
        const playLatency = Date.now() - playAttemptTimeRef.current;
        console.debug(`Video play latency: ${playLatency}ms`);
      } catch (error) {
        console.error('Play failed:', error);
        handlePlayError(error as Error);
      }
    }, [hasError, onPlay]);

    // Handle pause action
    const handlePause = useCallback(() => {
      if (!videoRef.current) return;

      videoRef.current.pause();
      setPlaybackState('paused');
      onPause?.();
    }, [onPause]);

    // Handle play errors with retry logic
    const handlePlayError = useCallback(
      (error: Error) => {
        console.error('Video play error:', error);

        if (retryCount < REELS_CONFIG.PLAYBACK.RETRY_ATTEMPTS) {
          const delay = REELS_CONFIG.PLAYBACK.RETRY_DELAY * (retryCount + 1);

          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            handlePlay();
          }, delay);
        } else {
          setPlaybackState('error');
          setHasError(true);
          setErrorMessage(REELS_ERRORS.VIDEO_LOAD_FAILED);
          onError?.(REELS_ERRORS.VIDEO_LOAD_FAILED);
        }
      },
      [retryCount, handlePlay, onError],
    );

    // Volume control
    const setVolumeInternal = useCallback((vol: number) => {
      const clampedVolume = Math.max(0, Math.min(1, vol));
      setVolumeState(clampedVolume);

      if (videoRef.current) {
        videoRef.current.volume = clampedVolume;
      }
    }, []);

    // Mute toggle
    const toggleMute = useCallback(() => {
      const newMuted = !isMuted;
      setIsMuted(newMuted);

      if (videoRef.current) {
        videoRef.current.muted = newMuted;
      }
    }, [isMuted]);

    // Video event handlers
    const handleLoadStart = useCallback(() => {
      setIsLoading(true);
      setPlaybackState('loading');
      loadStartTimeRef.current = Date.now();
      onLoadStart?.();
    }, [onLoadStart]);

    const handleLoadedMetadata = useCallback(() => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    }, []);

    const handleLoadedData = useCallback(() => {
      setIsLoading(false);
      setCanPlay(true);
      setPlaybackState('idle');

      // Track loading performance
      const loadTime = Date.now() - loadStartTimeRef.current;
      console.debug(`Video load time: ${loadTime}ms`);

      onLoadedData?.();
    }, [onLoadedData]);

    const handleTimeUpdate = useCallback(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 0;

        setCurrentTime(time);
        onTimeUpdate?.(time, dur);
      }
    }, [onTimeUpdate]);

    const handleProgress = useCallback(() => {
      if (videoRef.current && videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(
          videoRef.current.buffered.length - 1,
        );
        const duration = videoRef.current.duration || 0;
        const bufferedPercent =
          duration > 0 ? (bufferedEnd / duration) * 100 : 0;

        setBuffered(bufferedPercent);
        onProgress?.(bufferedPercent);
      }
    }, [onProgress]);

    const handleEnded = useCallback(() => {
      setPlaybackState('ended');
      setCurrentTime(0);
      onEnded?.();
    }, [onEnded]);

    const handleError = useCallback(
      (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        const videoElement = event.currentTarget;
        const error = videoElement.error;

        let errorMsg: string = REELS_ERRORS.VIDEO_LOAD_FAILED;

        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMsg = 'Video loading was aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMsg = REELS_ERRORS.NETWORK_ERROR;
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMsg = 'Video decoding failed';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMsg = REELS_ERRORS.UNSUPPORTED_FORMAT;
              break;
            default:
              errorMsg = REELS_ERRORS.UNKNOWN_ERROR;
          }
        }

        console.error('Video error:', error);
        setPlaybackState('error');
        setHasError(true);
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
      },
      [onError],
    );

    const handleWaiting = useCallback(() => {
      if (playbackState === 'playing') {
        setPlaybackState('loading');
      }
    }, [playbackState]);

    const handleCanPlay = useCallback(() => {
      if (playbackState === 'loading') {
        setPlaybackState('playing');
      }
    }, [playbackState]);

    // Get video source with quality selection
    const getVideoSource = useCallback(() => {
      if (currentQuality === 'auto' || !video.qualities) {
        return video.videoUrl;
      }

      return (
        video.qualities[currentQuality as keyof typeof video.qualities] ||
        video.videoUrl
      );
    }, [video.videoUrl, video.qualities, currentQuality]);

    // Reset states when video changes
    useEffect(() => {
      setHasError(false);
      setErrorMessage(null);
      setRetryCount(0);
      setCurrentTime(0);
      setDuration(0);
      setBuffered(0);
      setCanPlay(false);
      setIsLoading(true);
      setHasStartedPlaying(false);
      setPlaybackState('idle');
    }, [video.id]);

    // Initialize video properties
    useEffect(() => {
      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.muted = isMuted;
        videoElement.volume = volume;
        videoElement.loop = loop;
        videoElement.preload = preload;
      }
    }, [isMuted, volume, loop, preload]);

    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        {/* Main video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={video.posterUrl || video.thumbnailUrl}
          playsInline
          webkit-playsinline="true" // iOS Safari support
          onLoadStart={handleLoadStart}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onPlay={() => setPlaybackState('playing')}
          onPause={() => setPlaybackState('paused')}
          onEnded={handleEnded}
          onError={handleError}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          data-video-id={video.id}
        >
          <source src={getVideoSource()} type="video/mp4" />

          {/* Fallback for different qualities */}
          {video.qualities &&
            Object.entries(video.qualities).map(([quality, url]) => (
              <source key={quality} src={url} type="video/mp4" />
            ))}

          <p className="text-white">
            Your browser does not support the video tag.
          </p>
        </video>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm opacity-80">Loading...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Playback Error</h3>
              <p className="text-sm text-gray-300 mb-4">
                {errorMessage || 'Failed to load video'}
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setRetryCount(0);
                  window.location.reload();
                }}
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Buffering indicator */}
        {playbackState === 'loading' && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Play button overlay (when not started) */}
        {!hasStartedPlaying &&
          !isLoading &&
          !hasError &&
          playbackState !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors group"
                aria-label="Play video"
              >
                <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

        {/* Quality indicator */}
        {currentQuality !== 'auto' && (
          <div className="absolute top-3 left-3 z-10">
            <div className="quality-indicator text-white">
              {currentQuality.toUpperCase()}
            </div>
          </div>
        )}

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-3 left-3 text-xs text-white/70 bg-black/50 p-2 rounded">
            <div>State: {playbackState}</div>
            <div>
              Time: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </div>
            <div>Buffered: {buffered.toFixed(1)}%</div>
            <div>Retries: {retryCount}</div>
          </div>
        )}
      </div>
    );
  },
);

ReelsVideoPlayer.displayName = 'ReelsVideoPlayer';
