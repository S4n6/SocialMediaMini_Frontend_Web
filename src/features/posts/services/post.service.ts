import { api } from '@/lib/axios';
import {
  CreatePostPayload,
  CreatePostResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '../types/create-post.types';
import type { Post, ApiResponse, PaginatedResponse } from '@/types';

// Types for Cloudinary integration
interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  folder: string;
  cloudName: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  order: number;
}

/**
 * Unified Posts Service - handles all post-related API operations
 */
export const postsService = {
  // ===== S3 DIRECT UPLOAD (PRESIGNED URL + SSE PATTERN) =====

  /**
   * Step 1 of the S3 direct-upload flow.
   * Asks the backend to generate short-lived S3 presigned PUT URLs for each file.
   * The backend also creates a session and returns a sessionId that scopes the
   * SSE channel used in Step 3.
   *
   * Expected response shape:
   *   { data: { sessionId: string; presignedUrls: PresignedUrlResponse[] } }
   */
  getPresignedUrls: async (
    files: PresignedUrlRequest[],
    signal?: AbortSignal,
  ): Promise<{ sessionId: string; presignedUrls: PresignedUrlResponse[] }> => {
    const response = await api.post(
      '/post-medias/presigned-urls',
      { files },
      { signal },
    );
    return response.data.data;
  },

  /**
   * Step 3 of the S3 direct-upload flow.
   * Notifies the backend that all S3 PUT uploads are done so it can start
   * processing (thumbnail generation, CDN replication, DB write, etc.).
   * The backend will emit an SSE event on the session channel when finished.
   */
  notifyUploadsComplete: async (
    sessionId: string,
    s3Keys: string[],
    signal?: AbortSignal,
  ): Promise<void> => {
    await api.post('/post-medias/complete', { sessionId, s3Keys }, { signal });
  },

  /**
   * Polls the backend for the status of an upload session.
   * Used as a fallback when the SSE connection drops before the 'complete'
   * event arrives.
   *
   * Expected response:
   *   { data: { status: 'pending' | 'completed' | 'failed'; urls?: string[] } }
   */
  pollUploadStatus: async (
    sessionId: string,
  ): Promise<{
    status: 'pending' | 'completed' | 'failed';
    urls?: string[];
  }> => {
    const response = await api.get(`/post-medias/status/${sessionId}`);
    return response.data.data;
  },

  // ===== POST CREATION & MANAGEMENT =====

  /**
   * Create a new post with client-side media upload
   */
  createPost: async (
    payload: CreatePostPayload,
  ): Promise<CreatePostResponse> => {
    console.log('Creating post with payload:', payload);
    const response = await api.post('/posts', payload);
    return response.data;
  },

  /**
   * Create post with media files (handles entire flow)
   */
  createPostWithMedia: async (
    payload: CreatePostPayload,
    mediaFiles?: File[],
  ): Promise<CreatePostResponse> => {
    const uploadedUrls: string[] = [];
    let createdPost: CreatePostResponse | null = null;

    try {
      // Step 1: Upload media files to Cloudinary if provided
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('Uploading media files to Cloudinary...');
        const mediaUrls = await postsService.uploadMediaFiles(mediaFiles);
        uploadedUrls.push(...mediaUrls);

        // Add media to payload
        payload.media = mediaUrls.map((url, index) => ({
          url,
          type: postsService.getMediaTypeFromUrl(url),
          order: index + 1,
        }));
      }

      // Step 2: Create post with media URLs
      console.log('Creating post with media URLs:', payload);
      createdPost = await postsService.createPost(payload);

      return createdPost;
    } catch (error) {
      console.error('Post creation failed:', error);

      // Cleanup uploaded files if post creation fails
      if (uploadedUrls.length > 0) {
        try {
          await postsService.cleanupUploadedFiles(uploadedUrls);
          console.log('Successfully cleaned up uploaded files');
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded files:', cleanupError);
        }
      }

      throw error;
    }
  },

  /**
   * Upload media files to Cloudinary with retry and error handling
   */
  uploadMediaFiles: async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    try {
      // Get Cloudinary signature
      const signature = await postsService.getCloudinarySignature();
      console.log('Obtained Cloudinary signature:', signature);

      // Upload files with progress tracking
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await postsService.uploadToCloudinary(
            file,
            signature,
            index,
          );
          uploadedUrls.push(result.secure_url);
          return result.secure_url;
        } catch (error) {
          // If one upload fails, cleanup already uploaded files
          if (uploadedUrls.length > 0) {
            await postsService.cleanupUploadedFiles(uploadedUrls);
          }
          throw new Error(
            `Failed to upload file ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      // Cleanup any uploaded files on failure
      if (uploadedUrls.length > 0) {
        await postsService.cleanupUploadedFiles(uploadedUrls);
      }
      throw error;
    }
  },

  /**
   * Get Cloudinary signature from backend
   */
  getCloudinarySignature: async (): Promise<CloudinarySignature> => {
    const response = await api.post('/post-medias/signature');
    return response.data.data;
  },

  /**
   * Upload single file to Cloudinary
   */
  uploadToCloudinary: async (
    file: File,
    signature: CloudinarySignature,
    index: number,
  ): Promise<CloudinaryUploadResult> => {
    // Use the SAME timestamp from signature (don't generate new one)
    const timestamp = signature.timestamp;

    console.log('=== Cloudinary Upload Debug ===');
    console.log('Signature from backend:', signature);
    console.log('Timestamp to use:', timestamp);

    const formData = new FormData();
    formData.append('file', file);

    // Add ONLY params that were used in signature generation
    formData.append('folder', signature.folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', signature.apiKey);
    formData.append('signature', signature.signature);

    // Let Cloudinary auto-generate public_id (don't specify it)
    // This way signature will be valid

    // Log the string that should match backend signature generation
    console.log('Params for signature check:', {
      folder: signature.folder,
      timestamp: timestamp,
    });

    // Determine resource type based on file type
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    // Use correct endpoint for the resource type
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`;

    console.log(`Uploading ${resourceType} to:`, uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error:', errorText);
      console.error('Response status:', response.status, response.statusText);
      throw new Error(
        `Cloudinary upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', result);
    return result;
  },

  /**
   * Cleanup uploaded files on failure
   */
  cleanupUploadedFiles: async (urls: string[]): Promise<void> => {
    if (urls.length === 0) return;

    try {
      // Extract public_ids from URLs
      const publicIds = urls.map(postsService.extractPublicIdFromUrl);

      // Call backend cleanup endpoint
      await api.delete('/post-medias/cleanup', {
        data: { publicIds },
      });
    } catch (error) {
      console.error('Failed to cleanup uploaded files:', error);
      // Don't throw as this is cleanup - log for manual cleanup
    }
  },

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicIdFromUrl: (url: string): string => {
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : '';
  },

  /**
   * Determine media type from URL or file
   */
  getMediaTypeFromUrl: (url: string): 'image' | 'video' => {
    return url.includes('/video/') ? 'video' : 'image';
  },

  /**
   * Get media type from file
   */
  getMediaTypeFromFile: (file: File): 'image' | 'video' => {
    return file.type.startsWith('video/') ? 'video' : 'image';
  },

  /**
   * Update post
   */
  updatePost: async (
    postId: string,
    postData: Partial<CreatePostPayload>,
  ): Promise<ApiResponse<Post>> => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  /**
   * Delete post
   */
  deletePost: async (postId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // ===== POST RETRIEVAL =====

  /**
   * Get paginated posts for feed
   */
  getFeedPosts: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Post>> => {
    const response = await api.get(
      `/posts/feed/timeline?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  /**
   * Get posts by user
   */
  getUserPosts: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Post>> => {
    const response = await api.get(
      `/posts?authorId=${userId}&page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  /**
   * Get single post
   */
  getPost: async (postId: string): Promise<ApiResponse<Post>> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Get posts with filters
   */
  getPosts: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      authorId?: string;
      hashtag?: string;
      search?: string;
    },
  ): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/posts?${params}`);
    return response.data;
  },

  // ===== POST INTERACTIONS =====
  // Note: Reaction and Comment methods moved to their respective feature modules
  // - Reactions: features/reactions/services/
  // - Comments: features/comments/services/
};

// Default export for backward compatibility
export default postsService;

// Named exports for specific functions (posts-related only)
export const {
  // S3 direct-upload helpers
  getPresignedUrls,
  notifyUploadsComplete,
  pollUploadStatus,
  // Post CRUD
  createPost,
  createPostWithMedia,
  uploadMediaFiles,
  updatePost,
  deletePost,
  getFeedPosts,
  getUserPosts,
  getPost,
  getPosts,
} = postsService;
