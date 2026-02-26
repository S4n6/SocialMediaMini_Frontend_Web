/**
 * User entity types (based on Prisma User model)
 */

import { BaseEntity, UserRole, UserStatus } from '../shared';

// ===== CORE USER ENTITY =====

export interface User extends BaseEntity {
  fullName: string;
  username: string;
  userName?: string; // API compatibility
  email: string;
  passwordHash?: string;
  googleId?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  gender?: string;
  websiteUrl?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastProfileUpdate?: string;
  // API counts structure (optional for base User)
  _count?: {
    posts: number;
    followers: number;
    following: number;
    stories?: number;
  };
  // API compatibility fields
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

// ===== USER WITH RELATIONS =====

export interface UserWithStats extends User {
  _count: {
    posts: number;
    followers: number;
    following: number;
    stories: number;
  };
  // API compatibility fields
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

export interface UserProfile extends UserWithStats {
  isFollowing: boolean;
  isFollowedBy: boolean;
  mutualFollowersCount: number;
}

// ===== USER STATS =====

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  storiesCount: number;
}

// ===== USER FORMS AND UPDATES =====

export interface CreateUserData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth?: string;
}

export interface UpdateUserData {
  fullName?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  avatar?: File | string;
  gender?: string;
  phoneNumber?: string;
}

export interface UpdateProfileData extends UpdateUserData {
  // Additional profile-specific fields
}

// ===== PROFILE STATS =====

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

// ===== LEGACY COMPATIBILITY =====

// Alias for backward compatibility
export interface UserLegacy {
  id: string;
  userName: string; // API uses userName
  username?: string; // legacy alias for compatibility
  email: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  profilePicture?: string; // legacy alias
  isVerified?: boolean;
  isPrivate?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  website?: string;
  websiteUrl?: string; // API alias
  location?: string;
  dateOfBirth?: string;
  birthDate?: string; // legacy alias
  phoneNumber?: string;
  gender?: string;
  role?: string;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  // API counts structure
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}
