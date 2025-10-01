// Story feature types

export interface Story {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  mediaUrl: string;
  mediaType: "image" | "video";
  duration?: number; // For videos, in seconds
  createdAt: string;
  expiresAt: string;
  views: StoryView[];
  isViewed?: boolean; // By current user
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
  userId: string;
  username: string;
  avatar: string;
  viewedAt: string;
}

export interface Sticker {
  id: string;
  type: "text" | "emoji" | "location" | "music" | "poll" | "question";
  position: {
    x: number;
    y: number;
  };
  rotation?: number;
  scale?: number;
  content?: any; // Depends on sticker type
}

export interface StoryCreateData {
  mediaFile: File;
  mediaType: "image" | "video";
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
