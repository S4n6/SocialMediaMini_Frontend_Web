// Types for Explore feature based on backend posts module
export interface ExplorePost {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'text';
  thumbnailUrl?: string;
  aspectRatio: number;
  createdAt: string;
  updatedAt: string;

  // Engagement metrics
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount?: number; // For videos

  // Content flags
  isSponsored?: boolean;
  isPinned?: boolean;
  visibility: 'public' | 'private' | 'friends';

  // User info (populated from backend)
  user: {
    id: string;
    username: string;
    name: string;
    fullName?: string;
    avatar?: string;
    isVerified?: boolean;
    bio?: string;
    postsCount?: number;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    isPrivate?: boolean;
  };

  // Media info for carousel
  mediaCount?: number;

  // Hashtags and mentions
  hashtags?: string[];
  mentions?: string[];

  // Location info
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface ExploreGrid {
  posts: ExplorePost[];
  hasMore: boolean;
  loading: boolean;
  error?: string;
  totalCount: number;
  currentPage: number;
}

export type ExploreCategory =
  | 'all'
  | 'posts'
  | 'reels'
  | 'shopping'
  | 'igtv'
  | 'tagged';

export interface ExploreFilters {
  category: ExploreCategory;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'trending' | 'recent' | 'popular' | 'mostLiked';
  mediaType?: 'image' | 'video' | 'carousel' | 'all';
  location?: string;
  hashtag?: string;
}

export interface ExploreSearchParams {
  query?: string;
  hashtag?: string;
  location?: string;
  userId?: string;
  mediaType?: 'image' | 'video' | 'carousel';
  dateFrom?: string;
  dateTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: 'relevance' | 'recent' | 'popular' | 'oldest';
  minLikes?: number;
  minEngagement?: {
    likes?: number;
    comments?: number;
  };
  verified?: boolean;
  hasLocation?: boolean;
}

export interface ExploreState {
  posts: ExplorePost[];
  filters: ExploreFilters;
  searchParams: ExploreSearchParams;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

// API Response types matching backend
export interface ExplorePostsResponse {
  posts: ExplorePost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ExploreStatsResponse {
  totalPosts: number;
  todayPosts: number;
  weekPosts: number;
  trendingHashtags: string[];
  popularLocations: string[];
}

// Query parameters for API calls
export interface ExploreQueryParams {
  page?: number;
  limit?: number;
  category?: ExploreCategory;
  sortBy?: string;
  timeRange?: string;
  mediaType?: string;
  search?: string;
  hashtag?: string;
  location?: string;
  minLikes?: number;
  verified?: boolean;
}
