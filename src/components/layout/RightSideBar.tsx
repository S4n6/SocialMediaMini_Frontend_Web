'use client';

import React from 'react';
import { SidebarContent } from './SidebarContent';
import FriendSuggestionSection from '@/features/feed/components/friend-suggestion/friendSuggestionSection';

export const RightSideBar: React.FC = () => {
  return (
    <div className="hidden lg:block lg:w-1/4 p-4 border-l border-gray-200 dark:border-gray-700">
      <div className="sticky top-4 space-y-6">
        <FriendSuggestionSection />
        <SidebarContent />
      </div>
    </div>
  );
};

export default RightSideBar;
