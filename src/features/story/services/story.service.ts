import {
  Story,
  CreateStoryRequest,
  GetStoriesResponse,
  StoryError,
  StoryView,
} from '../types/story';
import {
  STORY_CONSTANTS,
  STORY_ERRORS,
  STORY_FILE_VALIDATION,
} from '../constants';
import { storyCache } from '../lib/cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');

export class StoryService {
  private static async fetchWithAuth(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(STORY_ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!STORY_FILE_VALIDATION.isValidSize(file.size)) {
      return {
        isValid: false,
        error: `${STORY_ERRORS.FILE_TOO_LARGE}. Maximum size: ${STORY_FILE_VALIDATION.getMaxSizeText()}`,
      };
    }

    if (!STORY_FILE_VALIDATION.isValidType(file.type)) {
      return {
        isValid: false,
        error: `${STORY_ERRORS.INVALID_FILE_TYPE}. Allowed types: ${STORY_FILE_VALIDATION.getAllowedTypesText()}`,
      };
    }

    return { isValid: true };
  }

  static async getStories(useCache: boolean = true): Promise<Story[]> {
    const cacheKey = 'stories_list';

    // Try to get from cache first
    if (useCache) {
      const cachedStories = storyCache.get<Story[]>(cacheKey);
      if (cachedStories) {
        console.log('📋 Using cached stories');
        return cachedStories;
      }
    }

    try {
      console.log('🌐 Fetching stories from API');
      const response = await this.fetchWithAuth('/stories');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || STORY_ERRORS.FETCH_FAILED);
      }

      const data: GetStoriesResponse = await response.json();

      // Cache the results for 3 minutes
      if (useCache) {
        storyCache.set(cacheKey, data.stories, 3);
      }

      return data.stories;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  static async createStory(data: CreateStoryRequest): Promise<Story> {
    try {
      // Validate file if provided
      if (data.mediaFile) {
        const validation = this.validateFile(data.mediaFile);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }

      const formData = new FormData();

      if (data.content) {
        formData.append('content', data.content);
      }

      if (data.mediaFile) {
        formData.append('media', data.mediaFile);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || STORY_ERRORS.UPLOAD_FAILED);
      }

      const newStory = await response.json();

      // Invalidate stories cache since we added a new story
      storyCache.delete('stories_list');
      console.log('🗑️ Cleared stories cache after creating new story');

      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  static async viewStory(storyId: string): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`/stories/${storyId}/view`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.warn('Failed to track story view');
      }
    } catch (error) {
      console.warn('Error viewing story:', error);
      // Don't throw - viewing is not critical
    }
  }

  static async getStoryViews(storyId: string): Promise<StoryView[]> {
    try {
      const response = await this.fetchWithAuth(`/stories/${storyId}/views`);

      if (!response.ok) {
        throw new Error('Failed to fetch story views');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching story views:', error);
      throw error;
    }
  }

  static async deleteStory(storyId: string): Promise<void> {
    try {
      const response = await this.fetchWithAuth(`/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }
}

// Legacy export for backward compatibility
export const storyService = {
  // Modern methods using new service
  getFeedStories: async () => {
    const stories = await StoryService.getStories();
    return { data: stories, success: true };
  },

  getUserStories: async (userId: string) => {
    const stories = await StoryService.getStories();
    // Filter by user (this would be done by backend in real implementation)
    const userStories = stories.filter((story) => story.userId === userId);
    return { data: userStories, success: true };
  },

  getStory: async (storyId: string) => {
    const stories = await StoryService.getStories();
    const story = stories.find((s) => s.id === storyId);
    if (!story) {
      throw new Error(STORY_ERRORS.STORY_NOT_FOUND);
    }
    return { data: story, success: true };
  },

  createStory: async (data: CreateStoryRequest) => {
    const story = await StoryService.createStory(data);
    return { data: story, success: true };
  },

  deleteStory: async (storyId: string) => {
    await StoryService.deleteStory(storyId);
    return { data: null, success: true };
  },

  viewStory: async (storyId: string) => {
    await StoryService.viewStory(storyId);
    return { data: null, success: true };
  },

  getStoryViews: async (storyId: string) => {
    const views = await StoryService.getStoryViews(storyId);
    return { data: { items: views, total: views.length }, success: true };
  },
};
