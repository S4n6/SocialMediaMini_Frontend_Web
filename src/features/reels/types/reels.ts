// Reels feature types based on Instagram 2025 design patterns
export interface ReelsVideo {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  posterUrl?: string; // First frame of video
  duration: number; // in seconds
  aspectRatio: number; // Usually 9:16 for vertical videos
  description?: string;
  musicId?: string;

  // Engagement metrics
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  savesCount?: number;

  // Content metadata
  createdAt: string;
  updatedAt: string;
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Hashtags and mentions
  hashtags?: string[];
  mentions?: string[];

  // User info (populated)
  user: {
    id: string;
    username: string;
    name: string;
    fullName?: string;
    avatar?: string;
    isVerified?: boolean;
    bio?: string;
    followersCount?: number;
    isPrivate?: boolean;
  };

  // Music/Audio info
  music?: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl?: string;
    duration: number;
    originalVideoId?: string; // If using audio from another video
  };

  // User engagement state
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean; // Following the video creator

  // Content flags
  isSponsored?: boolean;
  isRemix?: boolean; // If video uses audio from another video
  remixOriginalId?: string;
  visibility: 'public' | 'private' | 'friends';

  // Video quality info
  qualities?: {
    '360p'?: string;
    '480p'?: string;
    '720p'?: string;
    '1080p'?: string;
  };

  // Analytics (for creator)
  analytics?: {
    playCount: number;
    avgWatchTime: number; // seconds
    completionRate: number; // percentage
    engagementRate: number; // percentage
  };
}

export interface ReelsFeed {
  videos: ReelsVideo[];
  hasMore: boolean;
  loading: boolean;
  error?: string;
  totalCount: number;
  currentPage: number;
}

export type ReelsPlaybackState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export interface ReelsPlayerState {
  currentVideoId: string | null;
  currentIndex: number;
  playbackState: ReelsPlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number; // 0.5x, 1x, 1.25x, 1.5x, 2x
  quality: '360p' | '480p' | '720p' | '1080p' | 'auto';

  // UI state
  showControls: boolean;
  showInfo: boolean;

  // Buffering
  buffered: number; // percentage of video buffered
  isBuffering: boolean;
}

export interface ReelsInteractionState {
  videoId: string;
  isLiking: boolean;
  isSaving: boolean;
  isSharing: boolean;
  isFollowing: boolean;
  isCommenting: boolean;
}

export interface ReelsComment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;

  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };

  // Reply structure
  parentId?: string; // If this is a reply
  replies?: ReelsComment[];
}

export interface ReelsCreateData {
  videoFile: File;
  thumbnailFile?: File;
  description?: string;
  musicId?: string;
  location?: {
    name: string;
    coordinates?: { lat: number; lng: number };
  };
  hashtags?: string[];
  mentions?: string[];
  visibility: 'public' | 'private' | 'friends';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

export interface ReelsFilterOptions {
  timeRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'trending' | 'recent' | 'popular' | 'following';
  category?:
    | 'all'
    | 'music'
    | 'comedy'
    | 'dance'
    | 'food'
    | 'travel'
    | 'fashion'
    | 'sports';
  duration?: 'short' | 'medium' | 'long'; // <15s, 15-60s, >60s
  hasMusic?: boolean;
  location?: string;
}

export interface ReelsState {
  feed: ReelsFeed;
  player: ReelsPlayerState;
  interactions: Map<string, ReelsInteractionState>;
  comments: Map<string, ReelsComment[]>;
  filters: ReelsFilterOptions;

  // Navigation
  currentVideoIndex: number;
  preloadedVideos: Set<string>; // Video IDs that are preloaded

  // UI state
  isCommentsOpen: boolean;
  isShareModalOpen: boolean;
  isProfileModalOpen: boolean;
  selectedUserId?: string;
}

// API response types
export interface ReelsResponse {
  videos: ReelsVideo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ReelsStatsResponse {
  totalVideos: number;
  todayVideos: number;
  weekVideos: number;
  trendingHashtags: string[];
  popularSounds: Array<{
    id: string;
    title: string;
    artist: string;
    usageCount: number;
  }>;
}

// Query parameters for API calls
export interface ReelsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  category?: string;
  timeRange?: string;
  duration?: string;
  hasMusic?: boolean;
  location?: string;
  userId?: string; // For user's reels
  following?: boolean; // Only from followed users
}

// User types for Reels
export interface ReelsUser {
  id: string;
  username: string;
  name: string;
  fullName?: string;
  avatar?: string;
  isVerified?: boolean;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  isFollowing?: boolean;
  createdAt?: string;
  mutualFollowersCount?: number;
}

// Events for analytics
export interface ReelsAnalyticsEvent {
  type:
    | 'view'
    | 'play'
    | 'pause'
    | 'complete'
    | 'like'
    | 'comment'
    | 'share'
    | 'save'
    | 'follow';
  videoId: string;
  userId?: string;
  timestamp: number;
  metadata?: {
    watchTime?: number;
    playbackRate?: number;
    quality?: string;
    source?: 'feed' | 'profile' | 'search' | 'hashtag';
  };
}
