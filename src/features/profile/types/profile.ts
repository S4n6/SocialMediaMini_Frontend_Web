// Profile feature types

export type TabType = "posts" | "reels" | "tagged";

export interface Highlight {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Post {
  id: string;
  imageUrl: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  likes: number;
  comments: number;
  caption?: string;
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export interface ProfileData {
  id: string;
  username: string;
  fullName: string;
  bio?: string;
  profilePicture: string;
  isVerified?: boolean;
  isPrivate?: boolean;
  stats: ProfileStats;
}
