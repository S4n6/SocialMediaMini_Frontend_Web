/**
 * Domain Types - Business entities and models
 * Consolidated re-exports from entity modules
 */

// ===== SHARED TYPES =====
export * from './shared';

// ===== ENTITY TYPES =====
export * from './entities';

// ===== PROFILE SPECIFIC TYPES =====
// Keep profile-specific types here as they combine multiple entities

import type { User, UserStats, Post, Story } from './entities';

export interface ProfileData {
  user: User;
  stats: UserStats;
  posts: Post[];
  stories: Story[];
  isOwnProfile: boolean;
}

export type TabType = 'posts' | 'reels' | 'tagged';

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  storiesCount: number;
  stories: Story[];
}
