/**
 * Domain Types - Business entities and models
 * Consolidated from various feature type files
 */

// ===== USER TYPES =====

export interface User {
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
  // Legacy nested objects
  posts?: unknown[];
  followers?: unknown[];
  following?: unknown[];
}

export interface UserProfile extends User {
  isFollowing: boolean;
  isFollowedBy: boolean;
  mutualFollowersCount: number;
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  storiesCount: number;
}

// ===== POST TYPES =====

export interface Post {
  id: string;
  content: string;
  image?: string;
  video?: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  location?: string;
}

// Backwards compatibility aliases for legacy UI components
export type LegacyPost = Omit<
  Post,
  "likesCount" | "commentsCount" | "sharesCount" | "createdAt"
> & {
  likes: number;
  comments: number;
  shares?: number;
  images?: { id: string; imageUrl: string }[];
  timestamp: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
};

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface CreatePostData {
  content: string;
  image?: File | string;
  video?: File | string;
  tags?: string[];
  location?: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// ===== STORY TYPES =====

export interface Story {
  id: string;
  author: User;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  duration: number;
  viewsCount: number;
  hasViewed: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: string;
}

export interface StoryCreateData {
  mediaFile: File;
  caption?: string;
  duration?: number;
}

// ===== SEARCH TYPES =====

export interface SearchHistoryItem {
  id: string;
  user: User;
  searchedAt: string;
}

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: string[];
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "message";
  userId: string;
  targetUserId: string;
  entityId?: string;
  entityType?: "post" | "comment" | "user";
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// ===== FOLLOW TYPES =====

export interface FollowRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualFollowersCount: number;
}

// ===== MESSAGE TYPES =====

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "video" | "file";
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// ===== MEDIA TYPES =====

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  originalName: string;
  createdAt: string;
}

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

// ===== PROFILE SPECIFIC TYPES =====

export interface ProfileData {
  user: User;
  stats: UserStats;
  posts: Post[];
  stories: Story[];
  isOwnProfile: boolean;
}

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar?: File | string;
}

export type TabType = "posts" | "reels" | "tagged";

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  storiesCount: number;
  stories: Story[];
}
