import { BaseEntity } from '../shared/common';
import { User } from './user';

export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export interface Reaction extends BaseEntity {
  id: string;
  type: ReactionType;
  userId: string;
  user?: User;
  postId?: string;
  commentId?: string;
  storyId?: string;
}

export interface Follow extends BaseEntity {
  id: string;
  followerId: string;
  followingId: string;
  follower?: User;
  following?: User;
  isAccepted: boolean;
}

export interface Like extends BaseEntity {
  id: string;
  userId: string;
  user?: User;
  postId?: string;
  commentId?: string;
}

export interface Share extends BaseEntity {
  id: string;
  userId: string;
  postId: string;
  user?: User;
  shareText?: string;
}

export interface BookMark extends BaseEntity {
  id: string;
  userId: string;
  postId: string;
  user?: User;
}

export interface Block extends BaseEntity {
  id: string;
  blockerId: string;
  blockedId: string;
  blocker?: User;
  blocked?: User;
  reason?: string;
}

// Interaction aggregations
export interface InteractionCounts {
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
}
