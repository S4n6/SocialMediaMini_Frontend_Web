import { useState, useEffect } from 'react';
import { Story, CreateStoryRequest } from '../types/story';
import { StoryService } from '../services/story.service';
import { STORY_ERRORS } from '../constants';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStories = await StoryService.getStories();
      setStories(fetchedStories);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : STORY_ERRORS.FETCH_FAILED;
      setError(errorMessage);
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (data: CreateStoryRequest) => {
    try {
      setError(null);
      const newStory = await StoryService.createStory(data);
      setStories((prev) => [newStory, ...prev]);
      return newStory;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : STORY_ERRORS.UPLOAD_FAILED;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const viewStory = async (storyId: string) => {
    try {
      await StoryService.viewStory(storyId);
      // Update story view count locally if needed
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                viewCount: (story.viewCount || 0) + 1,
                hasViewed: true,
                viewedAt: new Date().toISOString(),
              }
            : story,
        ),
      );
    } catch (err) {
      // Silent fail for view tracking
      console.warn('Failed to track story view:', err);
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      setError(null);
      await StoryService.deleteStory(storyId);
      setStories((prev) => prev.filter((story) => story.id !== storyId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshStories = () => {
    fetchStories();
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    refetch: fetchStories,
    refresh: refreshStories,
    createStory,
    viewStory,
    deleteStory,
  };
};

// Additional hook for single story
export const useStory = (storyId: string) => {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStory = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const stories = await StoryService.getStories();
      const foundStory = stories.find((s) => s.id === id);
      if (!foundStory) {
        throw new Error(STORY_ERRORS.STORY_NOT_FOUND);
      }
      setStory(foundStory);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : STORY_ERRORS.STORY_NOT_FOUND;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storyId) {
      fetchStory(storyId);
    }
  }, [storyId]);

  return {
    story,
    loading,
    error,
    refetch: () => fetchStory(storyId),
  };
};
