import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storyService } from "../services/story.service";
import type { Story, StoryCreateData } from "../types/story";

// Query keys
export const storyKeys = {
  all: ["stories"] as const,
  feed: () => [...storyKeys.all, "feed"] as const,
  user: (userId: string) => [...storyKeys.all, "user", userId] as const,
  story: (storyId: string) => [...storyKeys.all, "story", storyId] as const,
  views: (storyId: string) => [...storyKeys.all, "views", storyId] as const,
  archived: () => [...storyKeys.all, "archived"] as const,
};

// Get feed stories
export const useFeedStories = () => {
  return useQuery({
    queryKey: storyKeys.feed(),
    queryFn: () => storyService.getFeedStories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (new name for cacheTime)
    retry: 2,
  });
};

// Get user stories
export const useUserStories = (userId: string) => {
  return useQuery({
    queryKey: storyKeys.user(userId),
    queryFn: () => storyService.getUserStories(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single story
export const useStory = (storyId: string) => {
  return useQuery({
    queryKey: storyKeys.story(storyId),
    queryFn: () => storyService.getStory(storyId),
    enabled: !!storyId,
  });
};

// Create story mutation
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyData: StoryCreateData) =>
      storyService.createStory(storyData),
    onSuccess: (newStory) => {
      // Update feed stories
      queryClient.setQueryData(storyKeys.feed(), (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: [newStory.data, ...oldData.data],
        };
      });

      // Update user stories
      queryClient.setQueryData(
        storyKeys.user(newStory.data.userId),
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: [newStory.data, ...oldData.data],
          };
        }
      );
    },
  });
};

// Delete story mutation
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => storyService.deleteStory(storyId),
    onSuccess: (_, storyId) => {
      // Update feed stories
      queryClient.setQueryData(storyKeys.feed(), (oldData: any) => {
        if (!oldData?.data || !Array.isArray(oldData.data)) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((story: Story) => story.id !== storyId),
        };
      });

      // Invalidate all story queries to refresh
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
  });
};

// View story mutation
export const useViewStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => storyService.viewStory(storyId),
    onSuccess: (_, storyId) => {
      // Update feed stories
      queryClient.setQueryData(storyKeys.feed(), (oldData: any) => {
        if (!oldData?.data || !Array.isArray(oldData.data)) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((story: Story) =>
            story.id === storyId ? { ...story, isViewed: true } : story
          ),
        };
      });
    },
  });
};
