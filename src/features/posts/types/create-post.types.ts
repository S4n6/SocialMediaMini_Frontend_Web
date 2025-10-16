// Types specific to post creation flow
export type PostCreationStep = 'upload' | 'details' | 'share';

export type PostPrivacy = 'public' | 'followers' | 'private';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export interface CreatePostMedia {
  url: string;
  type: 'image' | 'video';
  order: number;
}

// Frontend form data (matches UI state)
export interface PostFormData {
  caption: string;
  location?: string;
  tags: string[];
  accessibility?: string;
  privacy: PostPrivacy;
  advancedSettings?: {
    hideViewsAndLikes?: boolean;
    turnOffComments?: boolean;
  };
}

// Backend payload (matches API expected format)
export interface CreatePostPayload {
  content?: string; // Maps from caption
  privacy: PostPrivacy;
  media?: CreatePostMedia[];
  hashtags?: string[]; // Maps from tags
  // authorId is handled by backend from JWT token
}

// Response interfaces
export interface CreatePostResponse {
  id: string;
  content?: string;
  privacy: PostPrivacy;
  media: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    order: number;
  }>;
  hashtags: string[];
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}
