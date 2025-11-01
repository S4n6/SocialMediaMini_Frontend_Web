'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ReelsVideo } from '../types/reels';
import { REELS_UI } from '../constants/reels.constants';
import { ReelsVideoPlayer, ReelsVideoPlayerRef } from './ReelsVideoPlayer';
import { ReelsVideoControls } from './ReelsVideoControls';
import { ReelsCommentsOverlay } from './ReelsCommentsOverlay';
import { ReelsShareModal } from './ReelsShareModal';
import { useVideoControls } from '../hooks/useVideoControls';
import { useReelsEngagement } from '../hooks/useReelsEngagement';
import { useVideoGestures } from '../hooks/useVideoGestures';
import { useUserInteractions } from '../hooks/useUserInteractions';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { ReelsUserProfileModal } from './ReelsUserProfileModal';
import { ReelsFollowListModal } from './ReelsFollowListModal';

/**
 * Individual Reels video card - Instagram 2025 style with enhanced video player
 * Features: Full-screen video, floating UI, professional video playback
 *
 * Updated for Giai đoạn 1B with ReelsVideoPlayer integration
 */

interface ReelsVideoCardProps {
  video: ReelsVideo;
  isActive: boolean;
  onVideoRef?: (element: HTMLVideoElement | null) => void;
  showUI?: boolean;
  className?: string;
}

export const ReelsVideoCard: React.FC<ReelsVideoCardProps> = ({
  video,
  isActive,
  onVideoRef,
  showUI = true,
  className = '',
}) => {
  const playerRef = useRef<ReelsVideoPlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [playbackState, setPlaybackState] = useState<
    'playing' | 'paused' | 'loading'
  >('paused');
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Video controls hook
  const {
    isVisible: controlsVisible,
    handleInteraction,
    toggleControls,
    togglePlayPause,
  } = useVideoControls(playerRef, {
    autoHideDelay: 3000,
    showOnInteraction: true,
    persistOnPause: true,
  });

  // User interactions hook
  const {
    getUserProfile,
    followUser,
    unfollowUser,
    blockUser,
    reportUser,
    profileModalUserId,
    followListUserId,
    openProfileModal,
    closeProfileModal,
    openFollowListModal,
    closeFollowListModal,
    getRelationshipStatus,
  } = useUserInteractions({
    enableAnalytics: true,
  });

  // Performance monitoring hook
  const {
    startVideoSession,
    endVideoSession,
    recordEvent,
    trackVideoElement,
    currentMetrics,
  } = usePerformanceMonitor({
    enableCPUMonitoring: true,
    enableMemoryMonitoring: true,
    debugMode: false,
  });

  // Auto-play hook (for single video)
  const { registerVideo, isVideoPlaying, currentlyPlaying } = useAutoPlay(
    [video],
    {
      threshold: 0.7,
      enablePreloading: false, // Will be handled by parent feed
      debugMode: false,
    },
  );

  // Engagement hook
  const {
    isLiked,
    isSaved,
    isFollowing,
    likesCount,
    toggleLike,
    toggleSave,
    toggleFollow,
    shareVideo,
    handleDoubleTapLike,
    formatCount: formatEngagementCount,
    showLikeAnimation,
  } = useReelsEngagement({
    videoId: video.id,
    userId: video.user.id,
    initialState: {
      isLiked: video.isLiked || false,
      isSaved: video.isSaved || false,
      isFollowing: video.isFollowing || false,
      likesCount: video.likesCount,
    },
    onLike: async (videoId, isLiked) => {
      // Mock API call
      console.log(`${isLiked ? 'Liked' : 'Unliked'} video ${videoId}`);
    },
    onSave: async (videoId, isSaved) => {
      console.log(`${isSaved ? 'Saved' : 'Unsaved'} video ${videoId}`);
    },
    onFollow: async (userId, isFollowing) => {
      console.log(`${isFollowing ? 'Followed' : 'Unfollowed'} user ${userId}`);
    },
    onShare: async (videoId, platform) => {
      console.log(`Shared video ${videoId} on ${platform}`);
    },
  });

  // Handle video tap
  const handleVideoTap = useCallback(() => {
    handleInteraction();
    togglePlayPause();
  }, [handleInteraction, togglePlayPause]);

  // Gesture controls
  useVideoGestures(containerRef as React.RefObject<HTMLElement>, {
    onTap: handleVideoTap,
    onDoubleTap: handleDoubleTapLike,
  });

  // Auto-play when video becomes active with performance tracking
  useEffect(() => {
    if (isActive && playerRef.current) {
      // Start performance monitoring session
      startVideoSession(video.id);

      // Delay to ensure smooth scrolling
      const timer = setTimeout(() => {
        const startTime = performance.now();

        playerRef.current
          ?.play()
          .then(() => {
            setPlaybackState('playing');
            setShowPlayButton(false);

            // Record play event with time to play
            const timeToPlay = performance.now() - startTime;
            recordEvent(video.id, 'play', { timeToPlay });
          })
          .catch((error) => {
            recordEvent(video.id, 'error', { error: error.message });
          });
      }, 200);

      return () => clearTimeout(timer);
    } else if (!isActive && playerRef.current) {
      playerRef.current.pause();
      setPlaybackState('paused');
      setShowPlayButton(true);

      // Record pause event and end session if switching videos
      recordEvent(video.id, 'pause');
      if (currentlyPlaying !== video.id) {
        endVideoSession(video.id);
      }
    }
  }, [
    isActive,
    video.id,
    startVideoSession,
    recordEvent,
    endVideoSession,
    currentlyPlaying,
  ]);

  // Register video ref with parent and performance tracking
  useEffect(() => {
    if (onVideoRef && playerRef.current) {
      // Get the actual video element from the player
      const videoElement = playerRef.current.getVideoElement();
      onVideoRef(videoElement);

      // Register for auto-play monitoring
      if (videoElement) {
        registerVideo(video.id, videoElement);

        // Set up performance tracking
        const cleanup = trackVideoElement(video.id, videoElement);

        return cleanup;
      }
    }
  }, [onVideoRef, video.id, registerVideo, trackVideoElement]);

  // Handle user profile click
  const handleUserClick = useCallback(async () => {
    openProfileModal(video.user.id);
  }, [openProfileModal, video.user.id]);

  // Handle follow action in user interactions
  const handleFollowUser = useCallback(
    async (userId: string, shouldFollow: boolean) => {
      if (shouldFollow) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
    },
    [followUser, unfollowUser],
  );

  // Handle block user
  const handleBlockUser = useCallback(
    async (userId: string) => {
      await blockUser(userId);
    },
    [blockUser],
  );

  // Handle report user
  const handleReportUser = useCallback(
    async (userId: string, reason: string) => {
      await reportUser(userId, reason);
    },
    [reportUser],
  );

  return (
    <div
      className={`relative h-screen w-full bg-black flex items-center justify-center ${className}`}
      data-video-id={video.id}
    >
      {/* Video container - centered for vertical videos */}
      <div
        className="relative w-full max-w-sm h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {/* Professional Video Player */}
        <div className="w-full h-full cursor-pointer" onClick={handleVideoTap}>
          <ReelsVideoPlayer
            ref={playerRef}
            video={video}
            isActive={isActive}
            autoPlay={false} // We control this manually
            muted={true}
            loop={true}
            onPlay={() => {
              setPlaybackState('playing');
              setShowPlayButton(false);
            }}
            onPause={() => {
              setPlaybackState('paused');
              setShowPlayButton(true);
            }}
            onLoadStart={() => setPlaybackState('loading')}
            onError={(error) => {
              console.error('Video player error:', error);
              setPlaybackState('paused');
            }}
          />
        </div>
        {/* Video Controls Overlay */}
        <ReelsVideoControls
          playerRef={playerRef}
          isVisible={controlsVisible}
          onVisibilityChange={(visible) => {
            if (visible) handleInteraction();
          }}
          showProgressBar={true}
          showVolumeControl={true}
          showQualitySelector={false}
          showFullscreenToggle={true}
        />
        {/* Play/Pause overlay indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {showPlayButton && playbackState === 'paused' && (
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm animate-fade-in">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
            </div>
          )}

          {playbackState === 'loading' && (
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>{' '}
        {showUI && (
          <>
            {/* Right side actions - Instagram style */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-6 z-20">
              {/* User avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                  {video.user.avatar ? (
                    <img
                      src={video.user.avatar}
                      alt={video.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {video.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow button */}
                {!isFollowing && (
                  <button
                    onClick={toggleFollow}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-red-600 transition-colors"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Like button */}
              <button
                onClick={toggleLike}
                className="flex flex-col items-center gap-1 group relative"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className={`${isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-white'} group-hover:scale-110 transition-transform`}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>

                  {/* Like animation hearts */}
                  {showLikeAnimation && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-4 h-4 text-red-500 animate-ping"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
                            animationDelay: `${i * 100}ms`,
                            animationDuration: '600ms',
                          }}
                        >
                          ❤️
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-white text-xs font-medium">
                  {formatEngagementCount(likesCount)}
                </span>
              </button>

              {/* Comment button */}
              <button
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    className="group-hover:scale-110 transition-transform"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">
                  {formatEngagementCount(video.commentsCount)}
                </span>
              </button>

              {/* Share button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    className="group-hover:scale-110 transition-transform"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </div>
                <span className="text-white text-xs font-medium">
                  {formatEngagementCount(video.sharesCount)}
                </span>
              </button>

              {/* Save button */}
              <button
                onClick={toggleSave}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    className={`${isSaved ? 'fill-yellow-500 text-yellow-500' : 'fill-none text-white'} group-hover:scale-110 transition-transform`}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </div>
              </button>

              {/* Music/Sound indicator */}
              {video.music && (
                <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-spin-slow">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </button>
              )}
            </div>

            {/* Bottom content - User info and description */}
            <div className="absolute left-3 right-20 bottom-6 text-white z-20">
              {/* User info */}
              <div
                className="flex items-center gap-2 mb-3 cursor-pointer"
                onClick={handleUserClick}
              >
                <span className="font-semibold">@{video.user.username}</span>
                {video.user.isVerified && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#1DA1F2"
                  >
                    <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.57-2.11-9.96-5.02-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.14 2.14 4-.79-.02-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.62-.03-.92-.08.62 1.94 2.42 3.35 4.55 3.39-1.67 1.31-3.77 2.09-6.05 2.09-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55-.88.39-1.83.65-2.82.77z" />
                  </svg>
                )}
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-2 line-clamp-3">
                {video.description}
              </p>

              {/* Music info */}
              {video.music && (
                <div className="flex items-center gap-2 text-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <span className="opacity-80">
                    {video.music.title} - {video.music.artist}
                  </span>
                </div>
              )}

              {/* Location */}
              {video.location && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="opacity-80">{video.location.name}</span>
                </div>
              )}
            </div>

            {/* Top navigation - minimal for now */}
            <div className="absolute top-4 left-3 right-3 flex items-center justify-between text-white z-20">
              <div className="text-lg font-bold">Reels</div>
              <div className="w-6 h-6" /> {/* Placeholder for camera icon */}
            </div>

            {/* Progress indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${isActive ? '100%' : '0%'}` }}
              />
            </div>
          </>
        )}
        {/* Comments Overlay */}
        <ReelsCommentsOverlay
          videoId={video.id}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
          initialCount={video.commentsCount}
        />
        {/* Share Modal */}
        <ReelsShareModal
          videoId={video.id}
          isVisible={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={async (videoId, platform) => {
            await shareVideo(platform as any);
          }}
        />
        {/* User Profile Modal */}
        {profileModalUserId && (
          <ReelsUserProfileModal
            user={video.user}
            isVisible={profileModalUserId === video.user.id}
            onClose={closeProfileModal}
            onFollow={handleFollowUser}
            onViewProfile={(userId) => {
              // Navigate to full profile page - implement routing logic
              console.log('Navigate to profile:', userId);
            }}
            onBlock={handleBlockUser}
            onReport={handleReportUser}
          />
        )}
        {/* Follow List Modal */}
        {followListUserId && (
          <ReelsFollowListModal
            isVisible={followListUserId === video.user.id}
            onClose={closeFollowListModal}
            userId={video.user.id}
            userName={video.user.name}
            onFollow={handleFollowUser}
            onViewProfile={(userId) => {
              closeFollowListModal();
              openProfileModal(userId);
            }}
            onRemoveFollower={async (userId) => {
              // Implement remove follower logic
              console.log('Remove follower:', userId);
            }}
          />
        )}
      </div>
    </div>
  );
};
