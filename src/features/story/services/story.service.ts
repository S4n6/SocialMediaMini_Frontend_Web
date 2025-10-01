import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Story, StoryCreateData, StoryView } from "../types/story";

export const storyService = {
  // Get stories for home feed
  getFeedStories: async (): Promise<ApiResponse<Story[]>> => {
    const response = await api.get("/stories/feed");
    return response.data;
  },

  // Get stories by user ID
  getUserStories: async (userId: string): Promise<ApiResponse<Story[]>> => {
    const response = await api.get(`/stories/user/${userId}`);
    return response.data;
  },

  // Get single story
  getStory: async (storyId: string): Promise<ApiResponse<Story>> => {
    const response = await api.get(`/stories/${storyId}`);
    return response.data;
  },

  // Create new story
  createStory: async (
    storyData: StoryCreateData
  ): Promise<ApiResponse<Story>> => {
    const formData = new FormData();
    formData.append("media", storyData.mediaFile);
    formData.append("mediaType", storyData.mediaType);

    if (storyData.duration) {
      formData.append("duration", storyData.duration.toString());
    }

    if (storyData.stickers) {
      formData.append("stickers", JSON.stringify(storyData.stickers));
    }

    if (storyData.music) {
      formData.append("music", storyData.music);
    }

    if (storyData.location) {
      formData.append("location", storyData.location);
    }

    if (storyData.mentions) {
      formData.append("mentions", JSON.stringify(storyData.mentions));
    }

    formData.append("canReply", storyData.canReply?.toString() || "true");

    const response = await api.post("/stories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete story
  deleteStory: async (storyId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  },

  // Mark story as viewed
  viewStory: async (storyId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
  },

  // Get story views
  getStoryViews: async (
    storyId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<StoryView>>> => {
    const response = await api.get(
      `/stories/${storyId}/views?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Report story
  reportStory: async (
    storyId: string,
    reason: string
  ): Promise<ApiResponse<null>> => {
    const response = await api.post(`/stories/${storyId}/report`, {
      reason,
    });
    return response.data;
  },

  // Get archived stories (user's own)
  getArchivedStories: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Story>>> => {
    const response = await api.get(
      `/stories/archived?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
