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

// =============================================================================
// S3 DIRECT UPLOAD TYPES
// =============================================================================

/**
 * The 6 explicit states of the upload flow (finite state machine).
 * This replaces scattered boolean flags with a single source of truth.
 */
export type UploadState =
  | 'idle'
  | 'requesting_url' // Fetching presigned URLs from backend
  | 'uploading_to_s3' // PUTting files to S3 via XHR
  | 'waiting_for_sse' // S3 done, waiting for backend SSE confirmation
  | 'success' // Backend confirmed processing complete
  | 'error'; // Any stage failed

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string; // The signed S3 PUT URL (expires in `expiresIn` seconds)
  s3Key: string; // The object key in S3 (used by backend to reference the file)
  expiresIn: number; // How long the URL is valid
}

/** Per-file progress tracked during the S3 upload phase. */
export interface FileUploadProgress {
  name: string;
  size: number;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  s3Key?: string;
  errorMessage?: string;
}

/** Full state held by `useDirectUpload`. */
export interface DirectUploadContext {
  state: UploadState;
  files: FileUploadProgress[];
  overallProgress: number;
  error: string | null;
  sessionId: string | null; // Backend session ID used to scope the SSE channel
  completedUrls: string[]; // Final CDN/S3 URLs returned by backend after processing
}

// =============================================================================
// Response interfaces
// =============================================================================

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
