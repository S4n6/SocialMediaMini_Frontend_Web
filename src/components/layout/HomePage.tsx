'use client';

import React from 'react';
import { FeedSection } from '@/features/feed/components/FeedSection';
import { StoriesContainer } from '@/features/story/components/StoriesContainer';
import { RightSideBar } from './RightSideBar';
import { mockPosts, mockStories, mockCurrentUser } from '@/data/mockHomeData';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Main Content */}
      <div className="flex-1 lg:w-3/4 p-4 lg:p-6 max-w-full lg:max-w-4xl mx-auto">
        {/* Stories Section */}
        <StoriesContainer
          mockStories={mockStories}
          currentUser={mockCurrentUser}
        />

        {/* Posts Feed Section */}
        <FeedSection />
      </div>

      {/* Right Sidebar */}
      <RightSideBar />
    </div>
  );
};
