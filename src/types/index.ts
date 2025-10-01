/**
 * Consolidated Types - Single source of truth for all type exports
 * Import from this file instead of individual type files
 */

// ===== CORE API TYPES =====
export * from "./api";
export * from "./forms";
export * from "./socket";

// ===== DOMAIN TYPES =====
export * from "./domain";

// ===== AUTHENTICATION TYPES =====
export * from "./auth";

// ===== LEGACY EXPORTS (TODO: Remove after migration) =====
// These are kept for backward compatibility during migration
// Remove these once all imports are updated

// User types - now in domain.ts
export type { User, UserProfile, UserStats } from "./domain";

// Post types - now in domain.ts
export type { Post, Comment, CreatePostData, UpdatePostData } from "./domain";

// Story types - now in domain.ts
export type { Story, StoryView, StoryCreateData } from "./domain";

// Search types - now in domain.ts
export type { SearchHistoryItem, SearchResult } from "./domain";

// Notification types - now in domain.ts
export type { Notification } from "./domain";

// Message types - now in domain.ts
export type { Message, Conversation } from "./domain";

// Media types - now in domain.ts
export type { MediaFile, ImageItem } from "./domain";

// Profile types - now in domain.ts
export type {
  ProfileData,
  ProfileStats,
  UpdateProfileData,
  TabType,
  Highlight,
} from "./domain";

// Auth types - now in auth.ts
export type {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  AuthState,
  AuthContextType,
} from "./auth";
