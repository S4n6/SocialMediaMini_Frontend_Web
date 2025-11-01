'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReelsVideo } from '../types/reels';
import { REELS_CONFIG, REELS_ERRORS } from '../constants/reels.constants';
import { ReelsVideoCard } from './ReelsVideoCard';
import { ReelsLoader } from './ReelsLoader';
import { useVideoPreloader } from '../hooks/useVideoPreloader';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

/**
 * Main Reels feed component - Instagram 2025 style
 * Features: Vertical scrolling, snap-to-video, infinite loading, keyboard navigation
 *
 * Design principles:
 * - Full-screen immersive experience
 * - Smooth vertical scrolling with snap
 * - Preloading for seamless playback
 * - Performance optimized for mobile
 */

interface ReelsFeedProps {
  className?: string;
  autoPlay?: boolean;
  showUI?: boolean; // For embedding in other components
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  className = '',
  autoPlay = true,
  showUI = true,
}) => {
  const [videos, setVideos] = useState<ReelsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Video preloader hook for intelligent preloading
  const {
    preloadedVideos,
    getPreloadedVideo,
    isVideoPreloaded,
    getPreloadProgress,
    totalMemoryUsage,
  } = useVideoPreloader(videos, currentIndex, {
    preloadRange: 2, // Preload 2 videos before/after current
    maxPreloadedVideos: 5,
    enableAdaptive: true,
    debugMode: false,
  });

  // Performance monitoring for the feed
  const { currentMetrics, getPerformanceSummary } = usePerformanceMonitor({
    enableCPUMonitoring: true,
    enableMemoryMonitoring: true,
    debugMode: false,
  });

  // Mock data for development - Instagram 2025 style content
  const mockVideos: ReelsVideo[] = [
    {
      id: '1',
      userId: 'chef_master_2025',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/360/640?random=1',
      posterUrl: 'https://picsum.photos/360/640?random=1',
      duration: 28,
      aspectRatio: 9 / 16,
      description:
        '✨ 5-minute pasta that went viral! Who else is trying this tonight? 🍝 #PastaHack #CookingTips #FoodTok #EasyRecipes',
      likesCount: 156780,
      commentsCount: 2847,
      sharesCount: 12456,
      viewsCount: 2340000,
      savesCount: 45890,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date().toISOString(),
      hashtags: ['PastaHack', 'CookingTips', 'FoodTok', 'EasyRecipes'],
      user: {
        id: 'chef_master_2025',
        username: 'chef_master',
        name: 'Chef Master',
        fullName: 'Marco Rossi',
        avatar: 'https://picsum.photos/100/100?random=1',
        isVerified: true,
        bio: '👨‍🍳 Professional Chef | 5M+ followers | Daily recipes',
        followersCount: 5200000,
        isPrivate: false,
      },
      music: {
        id: 'cooking_beats_1',
        title: 'Cooking Vibes',
        artist: 'Kitchen Sounds',
        duration: 30,
        thumbnailUrl: 'https://picsum.photos/50/50?random=1',
      },
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      visibility: 'public',
      qualities: {
        '360p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_1mb.mp4',
        '720p':
          'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      },
    },
    {
      id: '2',
      userId: 'travel_soul_2025',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_2mb.mp4',
      thumbnailUrl: 'https://picsum.photos/360/640?random=2',
      posterUrl: 'https://picsum.photos/360/640?random=2',
      duration: 42,
      aspectRatio: 9 / 16,
      description:
        '🌅 Bali sunrise hits different when you wake up at 4AM for it! Worth every second 🏝️ #BaliLife #SunriseChaser #TravelVibes #Wanderlust #Indonesia',
      likesCount: 89234,
      commentsCount: 1456,
      sharesCount: 7823,
      viewsCount: 1870000,
      savesCount: 28940,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date().toISOString(),
      hashtags: [
        'BaliLife',
        'SunriseChaser',
        'TravelVibes',
        'Wanderlust',
        'Indonesia',
      ],
      location: {
        name: 'Mount Batur, Bali',
        coordinates: { lat: -8.2425, lng: 115.3746 },
      },
      user: {
        id: 'travel_soul_2025',
        username: 'travel_soul',
        name: 'Travel Soul',
        fullName: 'Maya Chen',
        avatar: 'https://picsum.photos/100/100?random=2',
        isVerified: false,
        bio: '🌍 Digital nomad | 50+ countries | Travel tips & stories',
        followersCount: 987000,
        isPrivate: false,
      },
      music: {
        id: 'chill_vibes_1',
        title: 'Sunrise Serenity',
        artist: 'Nature Sounds',
        duration: 45,
      },
      isLiked: true,
      isSaved: false,
      isFollowing: true,
      visibility: 'public',
    },
    {
      id: '3',
      userId: 'dance_queen_2025',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/360/640?random=3',
      posterUrl: 'https://picsum.photos/360/640?random=3',
      duration: 18,
      aspectRatio: 9 / 16,
      description:
        '💃 New choreo to the trending sound! Can you keep up? Drop your version below 🔥 #DanceChallenge #TrendingDance #Choreo #DanceLife',
      likesCount: 234567,
      commentsCount: 4521,
      sharesCount: 18934,
      viewsCount: 3450000,
      savesCount: 67890,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
      hashtags: ['DanceChallenge', 'TrendingDance', 'Choreo', 'DanceLife'],
      user: {
        id: 'dance_queen_2025',
        username: 'dance_queen',
        name: 'Dance Queen',
        fullName: 'Zara Johnson',
        avatar: 'https://picsum.photos/100/100?random=3',
        isVerified: true,
        bio: '💃 Professional dancer | Choreo teacher | 3M+ followers',
        followersCount: 3200000,
        isPrivate: false,
      },
      music: {
        id: 'trending_beat_1',
        title: 'Beat Drop 2025',
        artist: 'DJ TrendMaster',
        duration: 20,
        originalVideoId: '3', // This video created the trending sound
      },
      isLiked: false,
      isSaved: true,
      isFollowing: false,
      visibility: 'public',
      isRemix: false,
    },
    {
      id: '4',
      userId: 'fitness_guru_2025',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/360/640?random=4',
      posterUrl: 'https://picsum.photos/360/640?random=4',
      duration: 35,
      aspectRatio: 9 / 16,
      description:
        '🔥 10-minute morning routine that changed my life! No equipment needed 💪 Save this for tomorrow morning! #MorningWorkout #FitnessMotivation #HealthyLifestyle #WorkoutAtHome',
      likesCount: 145892,
      commentsCount: 2156,
      sharesCount: 9876,
      viewsCount: 2890000,
      savesCount: 54321,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      updatedAt: new Date().toISOString(),
      hashtags: [
        'MorningWorkout',
        'FitnessMotivation',
        'HealthyLifestyle',
        'WorkoutAtHome',
      ],
      user: {
        id: 'fitness_guru_2025',
        username: 'fitness_guru',
        name: 'Fitness Guru',
        fullName: 'Alex Thompson',
        avatar: 'https://picsum.photos/100/100?random=4',
        isVerified: true,
        bio: '💪 Certified trainer | Transform your body & mind | 2M+ community',
        followersCount: 2100000,
        isPrivate: false,
      },
      music: {
        id: 'workout_energy_1',
        title: 'Morning Energy',
        artist: 'Workout Beats',
        duration: 40,
      },
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      visibility: 'public',
    },
    {
      id: '5',
      userId: 'tech_reviewer_2025',
      videoUrl:
        'https://sample-videos.com/zip/10/mp4/SampleVideo_720x1280_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/360/640?random=5',
      posterUrl: 'https://picsum.photos/360/640?random=5',
      duration: 52,
      aspectRatio: 9 / 16,
      description:
        '📱 iPhone 16 Pro Max vs Galaxy S25 Ultra - The ultimate camera test! Which one wins? 📸 #TechReview #iPhone16 #GalaxyS25 #CameraTest #TechTok',
      likesCount: 67891,
      commentsCount: 3247,
      sharesCount: 5432,
      viewsCount: 1560000,
      savesCount: 23456,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date().toISOString(),
      hashtags: [
        'TechReview',
        'iPhone16',
        'GalaxyS25',
        'CameraTest',
        'TechTok',
      ],
      user: {
        id: 'tech_reviewer_2025',
        username: 'tech_reviewer',
        name: 'Tech Reviewer',
        fullName: 'David Kim',
        avatar: 'https://picsum.photos/100/100?random=5',
        isVerified: true,
        bio: '📱 Tech reviewer | Latest gadgets | Honest reviews | 1.5M subs',
        followersCount: 1500000,
        isPrivate: false,
      },
      music: {
        id: 'tech_bg_1',
        title: 'Tech Background',
        artist: 'Synthwave Pro',
        duration: 60,
      },
      isLiked: true,
      isSaved: true,
      isFollowing: true,
      visibility: 'public',
    },
  ];

  // Initialize intersection observer for video visibility
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) return;

          const video = videoRefs.current.get(videoId);
          if (!video) return;

          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= REELS_CONFIG.PLAYBACK.SCROLL_THRESHOLD
          ) {
            // Video is visible enough to play
            if (autoPlay) {
              video.play().catch(console.error);
            }
          } else if (
            entry.intersectionRatio <= REELS_CONFIG.PLAYBACK.PAUSE_THRESHOLD
          ) {
            // Video is not visible enough, pause it
            video.pause();
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [...REELS_CONFIG.PERFORMANCE.INTERSECTION_THRESHOLD],
      },
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [autoPlay]);

  // Load initial videos
  useEffect(() => {
    const loadInitialVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call with realistic delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        setVideos(mockVideos);
        setHasMore(true);
      } catch (err) {
        setError(REELS_ERRORS.NETWORK_ERROR);
        console.error('Failed to load reels:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialVideos();
  }, []);

  // Load more videos when reaching the end
  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      // Simulate loading more videos
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate more mock videos with different IDs
      const moreVideos = mockVideos.map((video, index) => ({
        ...video,
        id: `${video.id}-${Date.now()}-${index}`,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }));

      setVideos((prev) => [...prev, ...moreVideos]);

      // Simulate end of content after several loads
      if (videos.length > 30) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more videos:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, videos.length, mockVideos]);

  // Handle scroll events for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Calculate current video index based on scroll position
      const newIndex = Math.round(scrollTop / clientHeight);
      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < videos.length
      ) {
        setCurrentIndex(newIndex);
      }

      // Load more when approaching the end
      if (scrollHeight - scrollTop - clientHeight < clientHeight * 2) {
        if (loadMoreTimeoutRef.current) {
          clearTimeout(loadMoreTimeoutRef.current);
        }

        loadMoreTimeoutRef.current = setTimeout(() => {
          loadMoreVideos();
        }, 300);
      }
    },
    [currentIndex, videos.length, loadMoreVideos],
  );

  // Register video ref
  const registerVideoRef = useCallback(
    (videoId: string, element: HTMLVideoElement | null) => {
      if (element) {
        videoRefs.current.set(videoId, element);
      } else {
        videoRefs.current.delete(videoId);
      }
    },
    [],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showUI) return;

      switch (e.code) {
        case 'ArrowDown':
        case 'Space':
          e.preventDefault();
          // Scroll to next video
          if (currentIndex < videos.length - 1) {
            containerRef.current?.scrollTo({
              top: (currentIndex + 1) * window.innerHeight,
              behavior: 'smooth',
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Scroll to previous video
          if (currentIndex > 0) {
            containerRef.current?.scrollTo({
              top: (currentIndex - 1) * window.innerHeight,
              behavior: 'smooth',
            });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, showUI]);

  // Loading state
  if (loading) {
    return <ReelsLoader />;
  }

  // Error state
  if (error && videos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory ${className}`}
      onScroll={handleScroll}
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {videos.map((video, index) => (
        <ReelsVideoCard
          key={video.id}
          video={video}
          isActive={index === currentIndex}
          onVideoRef={(element: HTMLVideoElement | null) =>
            registerVideoRef(video.id, element)
          }
          showUI={showUI}
          className="snap-start snap-always"
        />
      ))}

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="h-screen flex items-center justify-center bg-black snap-start">
          <div className="flex items-center gap-3 text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more reels...</span>
          </div>
        </div>
      )}

      {/* End of content indicator */}
      {!hasMore && videos.length > 0 && (
        <div className="h-screen flex items-center justify-center bg-black snap-start">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              You're all caught up!
            </h3>
            <p className="text-gray-400">
              Check back later for more amazing content
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
