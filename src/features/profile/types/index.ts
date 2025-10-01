import { User } from "@/types/user";

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface ProfileData extends User {
  stats: ProfileStats;
  isFollowing?: boolean;
  isFollowingMe?: boolean;
  mutualFollowersCount?: number;
  mutualFollowers?: User[];
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  websiteUrl?: string;
  avatar?: File | string;
  isPrivate?: boolean;
}

export interface ProfileSettings {
  isPrivate: boolean;
  allowComments: boolean;
  allowTags: boolean;
  showActivityStatus: boolean;
  allowStoryReplies: boolean;
}
