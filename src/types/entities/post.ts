/**
 * Post entity types (based on Prisma Post model)
 */

import { BaseEntity, PostPrivacy } from '../shared';
import { User } from './user';
import { PostMedia } from '../shared/media';

// ===== CORE POST ENTITY =====

export interface Post extends BaseEntity {
  content?: string;
  privacy: PostPrivacy;
  authorId: string;
  author: User;
  // Compatibility fields for legacy components
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isBookmarked?: boolean;
}

// ===== POST WITH RELATIONS =====

export interface PostWithDetails extends Post {
  postMedia: PostMedia[];
  reactions: Reaction[];
  comments: Comment[];
  _count: {
    reactions: number;
    comments: number;
  };
}

// ===== POST INTERACTIONS =====

export interface Reaction extends BaseEntity {
  type: string;
  reactorId: string;
  reactor: User;
  postId?: string;
  commentId?: string;
}

export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  author: User;
  postId: string;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  reactions: Reaction[];
  _count: {
    reactions: number;
    replies: number;
  };
}

// ===== POST FORMS AND UPDATES =====

export interface CreatePostData {
  content?: string;
  privacy?: PostPrivacy;
  mediaFiles?: File[];
  tags?: string[];
  location?: string;
}

export interface UpdatePostData {
  id: string;
  content?: string;
  privacy?: PostPrivacy;
}

// ===== LEGACY COMPATIBILITY =====

// Legacy post format for existing UI components
export interface LegacyPost {
  id: string;
  content: string;
  likes: number;
  comments: number;
  shares?: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timestamp: string;
  status?: 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  images?: { id: string; imageUrl: string; caption?: string }[];
  video?: { id: string; videoUrl: string; thumbnailUrl?: string };
  author: {
    id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  tags?: string[];
  location?: string;
}

// Standard post format
export interface StandardPost extends BaseEntity {
  content: string;
  image?: string;
  video?: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags?: string[];
  location?: string;
}
