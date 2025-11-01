'use client';

import React, { Suspense, useState } from 'react';
import { StoriesSection } from './StoriesSection';
import StoriesSkeleton from './StoriesSkeleton';
import { StoryErrorBoundary } from './StoryErrorBoundary';
import { SmartErrorFallback } from './ErrorFallbacks';
import { StoryCreationModal } from './StoryCreationModal';
import { useStories } from '../hooks/useStories';
import { useStoryErrorHandler } from '../hooks/useStoryErrorHandler';
import { CurrentUser } from '../types/story';

interface StoriesContainerProps {
  mockStories?: any[]; // Fallback mock data for development
  currentUser?: CurrentUser;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({
  mockStories = [],
  currentUser,
}) => {
  const { stories, loading, error, refetch, createStory, viewStory } =
    useStories();

  const errorHandler = useStoryErrorHandler();
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);

  // Event handlers
  const handleStoryClick = async (storyId: string) => {
    try {
      await viewStory(storyId);
    } catch (err) {
      errorHandler.handleError(err, 'Failed to view story');
    }
  };

  const handleAddStoryClick = () => {
    setIsCreationModalOpen(true);
  };

  const handleStoryCreated = async (newStoryData: any) => {
    try {
      // Create story using the service
      await createStory({
        mediaFile: newStoryData.mediaFile,
        content: newStoryData.content,
      });

      // Refresh stories list
      refetch();

      // Show success message
      console.log('Story created successfully!');
    } catch (err) {
      errorHandler.handleError(err, 'Failed to create story');
    }
  };

  const handleRetry = () => {
    errorHandler.clearError();
    refetch();
  };

  // Use stories from API or fallback to mock data
  const displayStories = stories.length > 0 ? stories : mockStories;

  // Show loading state
  if (loading) {
    return (
      <Suspense fallback={<StoriesSkeleton />}>
        <StoriesSkeleton />
      </Suspense>
    );
  }

  // Show error state with boundary
  if (error || errorHandler.error) {
    return (
      <StoryErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Story boundary error:', error, errorInfo);
        }}
      >
        <SmartErrorFallback
          error={error || errorHandler.error || 'Unknown error'}
          onRetry={handleRetry}
          isRetrying={errorHandler.isRetrying}
        />
      </StoryErrorBoundary>
    );
  }

  return (
    <>
      <StoryErrorBoundary
        onError={(error, errorInfo) => {
          errorHandler.handleError(error, 'Story component error');
          console.error('Story boundary error:', error, errorInfo);
        }}
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <Suspense fallback={<StoriesSkeleton />}>
          <StoriesSection
            stories={displayStories}
            currentUser={currentUser as any} // TODO: Fix type mismatch
            onStoryClick={handleStoryClick}
            onAddStoryClick={handleAddStoryClick}
          />
        </Suspense>
      </StoryErrorBoundary>

      {/* Story Creation Modal */}
      <StoryCreationModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onStoryCreated={handleStoryCreated}
        currentUser={currentUser}
      />
    </>
  );
};

export default StoriesContainer;
