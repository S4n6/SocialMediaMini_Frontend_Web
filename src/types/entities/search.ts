/**
 * Search and search history types (based on Prisma models)
 */

import { BaseEntity } from '../shared';
import { User } from './user';
import { Post } from './post';

// ===== SEARCH HISTORY ENTITIES =====

export interface SearchHistory extends BaseEntity {
  userId: string;
  user: User;
  entries: SearchHistoryEntry[];
}

export interface SearchHistoryEntry extends BaseEntity {
  searchedUserId: string;
  searchedAt: string;
  searchHistoryId: string;
  searchHistory: SearchHistory;
  searchedUser: User;
}

// ===== SEARCH RESULTS =====

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: Hashtag[];
  total: number;
}

export interface Hashtag extends BaseEntity {
  name: string;
  usageCount: number;
}

// ===== SEARCH FORMS =====

export interface SearchQuery {
  query: string;
  type?: 'users' | 'posts' | 'hashtags' | 'all';
  limit?: number;
  offset?: number;
}

export interface AddSearchHistoryData {
  searchedUserId: string;
}

// ===== LEGACY COMPATIBILITY =====

export interface SearchHistoryItem {
  id: string;
  user: User;
  searchedAt: string;
}
