// Story feature types - matching backend structure

export interface Story {
  id: string;
  userId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  isExpired: boolean;

  // User info (populated from backend)
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
  };

  // View tracking
  hasViewed?: boolean;
  viewedAt?: string;

  // Optional features (can be extended later)
  duration?: number; // For videos, in seconds
  canReply?: boolean;
  music?: {
    id: string;
    title: string;
    artist: string;
  };
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  mentions?: string[]; // User IDs
  stickers?: Sticker[];
}

export interface StoryView {
  id: string;
  storyId: string;
  userId: string;
  viewedAt: string;

  // User info for display
  user?: {
    username: string;
    avatar?: string;
  };
}

export interface Sticker {
  id: string;
  type: 'text' | 'emoji' | 'location' | 'music' | 'poll' | 'question';
  position: {
    x: number;
    y: number;
  };
  rotation?: number;
  scale?: number;
  content?: any; // Depends on sticker type
}

// API Request/Response types
export interface CreateStoryRequest {
  content?: string;
  mediaFile?: File;
}

export interface CreateStoryDto {
  content?: string;
  media?: File;
}

export interface GetStoriesResponse {
  stories: Story[];
  hasMore: boolean;
  total: number;
}

export interface StoryError {
  code:
    | 'STORY_NOT_FOUND'
    | 'STORY_EXPIRED'
    | 'ACCESS_DENIED'
    | 'VALIDATION_ERROR'
    | 'NETWORK_ERROR';
  message: string;
  details?: Record<string, any>;
}

// Legacy - for backward compatibility
export interface StoryCreateData {
  mediaFile: File;
  mediaType: 'image' | 'video';
  duration?: number;
  stickers?: Sticker[];
  music?: string; // Music ID
  location?: string; // Location name
  mentions?: string[]; // User IDs
  canReply?: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

// Props interfaces
export interface StoriesSectionProps {
  stories: Story[];
  currentUser: CurrentUser;
  onStoryClick: (storyId: string) => void;
  onAddStoryClick: () => void;
  isLoading?: boolean;
}

export interface StoryCardProps {
  story: Story;
  onClick: (storyId: string) => void;
  isViewed?: boolean;
}

export interface StoryViewerProps {
  stories: Story[];
  initialStoryId: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
