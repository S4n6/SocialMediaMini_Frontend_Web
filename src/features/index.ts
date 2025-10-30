// Auth Feature
export * from './auth';

// Posts Feature
export {
  PostCard,
  PostSection,
  CreatePostDialog,
  type Post as PostType,
} from './posts';

// Profile Feature
export {
  ProfileInfo,
  ProfileTabs,
  PostsGrid,
  StoryHighlights,
  useLegacyUser,
  type User,
  type TabType,
  type Highlight,
  type Post as ProfilePost,
  type ProfileStats,
  type ProfileData,
} from './profile';

// Search Feature
export * from './search';

// Feed Feature - explicit exports to avoid module resolution issues
export {
  FriendSuggestionCard,
  FriendSuggestionSection,
  type FollowStatus,
  type FollowConfig,
  type FollowState,
} from './feed/index';

// Story Feature
export {
  StoriesSection,
  StoryCard,
  useFeedStories,
  useUserStories,
  useStory,
  useCreateStory,
  useDeleteStory,
  useViewStory,
  storyKeys,
} from './story';

// Messages Feature
export * from './messages/types';
