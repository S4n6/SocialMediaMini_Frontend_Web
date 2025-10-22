// Components
export { default as FriendSuggestionCard } from './components/friend-suggestion/friendSuggestionCard';
export { default as FriendSuggestionSection } from './components/friend-suggestion/friendSuggestionSection';
export { FeedSection } from './components/FeedSection';
export { HomePage } from '../../components/layout/HomePage';
// Keep FeedPage export for backward compatibility
export { HomePage as FeedPage } from '../../components/layout/HomePage';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types - Export specific types to avoid conflicts
export type {
  // Feed types
  GetTimelineFeedParams,
  TimelineFeedResponse,
  FeedConfig,
  FeedState,
  FeedActions,
  FeedError,
  // Follow types (re-export main ones)
  FollowConfig as FeedFollowConfig,
  FollowState as FeedFollowState,
  FollowActions as FeedFollowActions,
  FollowStatus as FeedFollowStatus,
} from './types';
