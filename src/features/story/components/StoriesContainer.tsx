'use client';

import React, { Suspense } from 'react';
import {
  StoriesSection,
  useFeedStories,
  useCreateStory,
  useViewStory,
} from '@/features/story';
import StoriesSkeleton from '@/features/story/components/StoriesSkeleton';
import type { User } from '@/types';

interface StoriesContainerProps {
  mockStories?: any[]; // Fallback mock data for development
  currentUser: User;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({
  mockStories = [],
  currentUser,
}) => {
  const { data: storiesData, isLoading: storiesLoading } = useFeedStories();
  const createStory = useCreateStory();
  const viewStory = useViewStory();

  // Event handlers
  const handleStoryClick = (storyId: string) => {
    viewStory.mutate(storyId);
  };

  const handleAddStoryClick = () => {
    // Open story creation modal or navigate to create story page
    console.log('Add story clicked');
  };

  // Extract stories data
  const stories = storiesData?.data || [];

  return (
    <Suspense fallback={<StoriesSkeleton />}>
      <StoriesSection
        stories={stories.length > 0 ? stories : mockStories}
        currentUser={currentUser}
        onStoryClick={handleStoryClick}
        onAddStoryClick={handleAddStoryClick}
      />
    </Suspense>
  );
};

export default StoriesContainer;
