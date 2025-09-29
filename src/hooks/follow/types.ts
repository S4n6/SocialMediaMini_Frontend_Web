import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/api";

// Follow hook configuration
export interface FollowConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  enableToast?: boolean;
  userId?: string;
  targetUserId?: string;
}

// Follow state interface
export interface FollowState {
  followers: User[];
  following: User[];
  followStatus: FollowStatus | null;
  userStats: UserStats | null;
  isFollowing: boolean;
  isLoading: boolean;
  error: FollowError | null;
}

// Follow actions interface
export interface FollowActions {
  followUser: (targetId: string) => Promise<ApiResponse<unknown>>;
  unfollowUser: (targetId: string) => Promise<ApiResponse<unknown>>;
  toggleFollowUser: (targetId: string) => Promise<void>;
}

// Follow data types
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  followedAt?: string;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount?: number;
}

export interface FollowError {
  code: string;
  message: string;
  status?: number;
}

// Follow mutations options
export interface FollowMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: FollowError) => void;
}

// Follow query options
export interface FollowQueryOptions extends FollowConfig {
  enabled?: boolean;
  select?: (data: any) => any;
}

// Convenience method return type
export interface FollowActionsResult {
  isFollowing: boolean;
  isLoading: boolean;
  toggleFollow: () => Promise<void>;
  followUser: () => Promise<void>;
  unfollowUser: () => Promise<void>;
  error: FollowError | null;
}
