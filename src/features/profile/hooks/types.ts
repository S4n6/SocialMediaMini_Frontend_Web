import { User } from "@/types";

// ===== QUERY CONFIGURATIONS =====

/**
 * Configuration options for user queries
 */
export interface UserQueryConfig {
  /** Whether to enable real-time updates (default: false) */
  realtime?: boolean;
  /** Cache time in milliseconds (default: 5 minutes) */
  cacheTime?: number;
  /** Stale time in milliseconds (default: 1 minute) */
  staleTime?: number;
  /** Whether to retry failed requests (default: true) */
  retry?: boolean;
  /** Whether to refetch on window focus (default: false) */
  refetchOnWindowFocus?: boolean;
}

/**
 * Configuration for user search functionality
 */
export interface UserSearchConfig extends UserQueryConfig {
  /** Minimum query length to trigger search (default: 2) */
  minQueryLength?: number;
  /** Maximum number of results (default: 20) */
  limit?: number;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Include user statistics in results (default: false) */
  includeStats?: boolean;
}

/**
 * Configuration for user suggestions
 */
export interface UserSuggestionConfig extends UserQueryConfig {
  /** Number of suggestions to fetch (default: 10) */
  limit?: number;
  /** Base suggestions on user's network (default: true) */
  basedOnNetwork?: boolean;
  /** Include mutual connections info (default: true) */
  includeMutualConnections?: boolean;
}

// ===== USER PROFILE & SETTINGS =====

/**
 * User profile update data
 */
export interface UserProfileUpdate {
  fullName?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  gender?: string;
  websiteUrl?: string;
}

/**
 * User avatar/profile picture update
 */
export interface UserAvatarUpdate {
  avatar: File | string;
  /** Optional crop coordinates */
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * User account settings update
 */
export interface UserAccountSettings {
  /** Privacy settings */
  privacy?: {
    profileVisibility?: "public" | "private" | "friends";
    allowSearchByEmail?: boolean;
    allowSearchByPhone?: boolean;
    showOnlineStatus?: boolean;
  };
  /** Notification preferences */
  notifications?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    followNotifications?: boolean;
    messageNotifications?: boolean;
    postInteractionNotifications?: boolean;
  };
  /** Security settings */
  security?: {
    twoFactorEnabled?: boolean;
    loginAlerts?: boolean;
  };
}

/**
 * User password update data
 */
export interface UserPasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== SEARCH & DISCOVERY =====

/**
 * User search parameters
 */
export interface UserSearchParams {
  query: string;
  filters?: {
    /** Filter by location */
    location?: string;
    /** Filter by user verification status */
    verified?: boolean;
    /** Filter by mutual connections */
    mutualConnections?: boolean;
    /** Filter by user activity (active in last X days) */
    recentlyActive?: number;
  };
  /** Sort results by */
  sortBy?: "relevance" | "followers" | "recent" | "mutual";
  /** Page number for pagination */
  page?: number;
  /** Number of results per page */
  limit?: number;
}

/**
 * Enhanced user search result
 */
export interface UserSearchResult extends User {
  /** Search relevance score */
  relevanceScore?: number;
  /** Mutual connections with current user */
  mutualConnections?: {
    count: number;
    users: Pick<User, "id" | "userName" | "fullName" | "avatar">[];
  };
  /** Whether user is currently online */
  isOnline?: boolean;
  /** Last active timestamp */
  lastActive?: string;
  /** Follow status relative to current user */
  followStatus?: "following" | "followers" | "mutual" | "none";
}

/**
 * User suggestion item
 */
export interface UserSuggestion extends User {
  /** Reason for suggestion */
  suggestionReason:
    | "mutual_friends"
    | "location"
    | "interests"
    | "recent_activity"
    | "popular";
  /** Confidence score (0-100) */
  confidence: number;
  /** Mutual connections info */
  mutualConnections?: {
    count: number;
    commonFriends: Pick<User, "id" | "userName" | "fullName" | "avatar">[];
  };
}

// ===== STATISTICS & ANALYTICS =====

/**
 * Detailed user statistics
 */
export interface UserStatistics {
  /** Content statistics */
  content: {
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
    sharesReceived: number;
    /** Average engagement rate */
    engagementRate: number;
  };
  /** Network statistics */
  network: {
    followersCount: number;
    followingCount: number;
    mutualConnectionsCount: number;
    /** Follower growth rate (last 30 days) */
    followerGrowthRate: number;
  };
  /** Activity statistics */
  activity: {
    /** Profile views in last 30 days */
    profileViews: number;
    /** Last login timestamp */
    lastLogin: string;
    /** Account creation date */
    joinedDate: string;
    /** Days since last post */
    daysSinceLastPost: number;
  };
}

/**
 * User activity timeline item
 */
export interface UserActivityItem {
  id: string;
  type:
    | "post_created"
    | "post_liked"
    | "user_followed"
    | "profile_updated"
    | "joined";
  timestamp: string;
  data: Record<string, unknown>;
}

// ===== REQUEST/RESPONSE TYPES =====

/**
 * Get current user response
 */
export interface GetCurrentUserResponse {
  user: User | null;
  preferences?: UserAccountSettings;
  statistics?: UserStatistics;
}

/**
 * User search response
 */
export interface UserSearchResponse {
  users: UserSearchResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    appliedFilters: Partial<UserSearchParams["filters"]>;
    availableFilters: {
      locations: string[];
      categories: string[];
    };
  };
}

/**
 * User suggestions response
 */
export interface UserSuggestionsResponse {
  suggestions: UserSuggestion[];
  meta: {
    totalAvailable: number;
    refreshedAt: string;
    nextRefreshIn: number; // seconds
  };
}

// ===== ERROR HANDLING =====

/**
 * User-specific error types
 */
export type UserErrorType =
  | "user_not_found"
  | "profile_update_failed"
  | "avatar_upload_failed"
  | "invalid_credentials"
  | "password_update_failed"
  | "search_failed"
  | "suggestions_unavailable"
  | "permission_denied"
  | "rate_limit_exceeded";

/**
 * Enhanced error object for user operations
 */
export interface UserError extends Error {
  type: UserErrorType;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
  operation: string;
}

// ===== UTILITY TYPES =====

/**
 * User query factory keys
 */
export interface UserQueryKeys {
  all: readonly string[];
  currentUser: () => readonly string[];
  user: (id: string) => readonly string[];
  userWithStats: (id: string) => readonly string[];
  search: (params: UserSearchParams) => readonly (string | number | object)[];
  suggestions: (
    config?: UserSuggestionConfig
  ) => readonly (string | number | boolean)[];
  statistics: (userId: string) => readonly string[];
  activity: (
    userId: string,
    options?: { limit?: number; offset?: number }
  ) => readonly (string | number)[];
}

/**
 * User cache management options
 */
export interface UserCacheOptions {
  /** Invalidate specific user cache */
  invalidateUser?: string;
  /** Invalidate current user cache */
  invalidateCurrentUser?: boolean;
  /** Invalidate all search caches */
  invalidateSearches?: boolean;
  /** Invalidate suggestions cache */
  invalidateSuggestions?: boolean;
  /** Update specific user in cache */
  updateUserInCache?: { userId: string; updates: Partial<User> };
  /** Remove user from all caches */
  removeUserFromCache?: string;
}

/**
 * Hook configuration for useUser
 */
export interface UseUserConfig extends UserQueryConfig {
  /** Enable current user query (default: true) */
  enableCurrentUser?: boolean;
  /** Enable automatic cache management (default: true) */
  enableCacheManagement?: boolean;
  /** Enable Redux synchronization (default: true) */
  enableReduxSync?: boolean;
  /** Custom error handler */
  onError?: (error: UserError) => void;
  /** Custom success handler */
  onSuccess?: (operation: string, data: unknown) => void;
}
