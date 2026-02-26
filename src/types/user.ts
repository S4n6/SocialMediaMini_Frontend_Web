export interface User {
  id: string;
  username: string; // Standard field name
  userName?: string; // API compatibility alias
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
  // Legacy nested objects
  posts?: unknown[];
  followers?: unknown[];
  following?: unknown[];
}
