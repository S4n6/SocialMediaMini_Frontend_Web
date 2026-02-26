/**
 * Story entity types (based on Prisma Story model)
 */

import { BaseEntity, MediaType } from '../shared';
import { User } from './user';

// ===== CORE STORY ENTITY =====

export interface Story extends BaseEntity {
  content?: string;
  mediaUrl: string;
  mediaType: MediaType;
  expiresAt: string;
  authorId: string;
  author: User;
}

// ===== STORY WITH RELATIONS =====

export interface StoryWithViews extends Story {
  views: StoryView[];
  _count: {
    views: number;
  };
  hasViewed: boolean;
}

export interface StoryView extends BaseEntity {
  storyId: string;
  viewerId: string;
  viewer: User;
}

// ===== STORY FORMS =====

export interface CreateStoryData {
  content?: string;
  mediaFile: File;
  mediaType: MediaType;
  duration?: number;
}

export interface StoryCreateFormData {
  mediaFile: File;
  caption?: string;
  duration?: number;
}

// ===== STORY CONTAINERS =====

export interface StoryHighlight {
  id: string;
  title: string;
  coverImage: string;
  stories: Story[];
  storiesCount: number;
  createdAt: string;
}

// ===== LEGACY COMPATIBILITY =====

export interface LegacyStory {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  createdAt: string;
  expiresAt: string;
  views: any[];
  isViewed: boolean;
}
