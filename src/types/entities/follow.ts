/**
 * Follow relationship types (based on Prisma Follow model)
 */

import { BaseEntity } from '../shared';
import { User } from './user';

// ===== CORE FOLLOW ENTITY =====

export interface Follow extends BaseEntity {
  followerId: string;
  follower: User;
  followingId: string;
  following: User;
}

// ===== FOLLOW STATS =====

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualFollowersCount: number;
}

// ===== FOLLOW REQUESTS =====

export interface FollowRequest extends BaseEntity {
  requesterId: string;
  requester: User;
  targetUserId: string;
  target: User;
  status: 'pending' | 'accepted' | 'rejected';
}

// ===== FOLLOW OPERATIONS =====

export interface FollowOperation {
  userId: string;
  targetUserId: string;
  action: 'follow' | 'unfollow';
}

export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
  followersCount: number;
}
