"use client";

import RightSideBar from "@/components/layout/RightSideBar";
import { PostSection } from "@/features/posts";
import {
  StoriesSection,
  useFeedStories,
  useCreateStory,
  useViewStory,
} from "@/features/story";
import { useFeed } from "@/features/posts/hooks/use-post-actions";
import FriendSuggestionSection from "@/features/feed/components/friend-suggestion/friendSuggestionSection";
import StoriesSkeleton from "@/features/story/components/StoriesSkeleton";
import { Suspense } from "react";

export default function Home() {
  // Use real data hooks instead of mock data
  const {
    data: feedData,
    isLoading: postsLoading,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  const {
    data: storiesData,
    isLoading: storiesLoading,
  } = useFeedStories();

  const createStory = useCreateStory();
  const viewStory = useViewStory();

  const currentUser = {
    id: "current-user",
    fullName: "You",
    userName: "your_story",
    email: "you@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  // Event handlers
  const handleStoryClick = (storyId: string) => {
    viewStory.mutate(storyId);
  };

  const handleAddStoryClick = () => {
    // Open story creation modal or navigate to create story page
    console.log("Add story clicked");
  };

  const handleLoadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Extract posts from infinite query
  const posts = feedData?.pages.flatMap((page: any) => page.data) || [];
  const stories = storiesData?.data || [];

  // Handle error messages
  const postsErrorMessage = postsError?.message || null;

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 lg:w-3/4 p-4 lg:p-6 max-w-full lg:max-w-4xl mx-auto">
        {/* Stories Section */}
        <div className="mb-6">
          <Suspense fallback={<StoriesSkeleton />}>
            <StoriesSection
              stories={stories}
              currentUser={currentUser}
              onStoryClick={handleStoryClick}
              onAddStoryClick={handleAddStoryClick}
            />
          </Suspense>
        </div>

        {/* Posts Section */}
        <PostSection
          posts={posts}
          isLoading={postsLoading}
          error={postsErrorMessage}
          onLoadMore={handleLoadMorePosts}
          hasMore={hasNextPage}
        />
      </div>

      {/* Right Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block lg:w-1/4 p-4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="sticky top-4 space-y-6">
          <FriendSuggestionSection />
          <RightSideBar />
        </div>
      </div>
    </div>
  );
}
