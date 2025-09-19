"use client";

import RightSideBar from "@/components/layout/RightSideBar";
import PostSection from "@/components/post/PostSection";
import { StoriesSection } from "@/components/story/StoriesSection";
import { mockPosts, mockStories } from "@/data/mock";
import { useState } from "react";

export default function Home() {
  const [posts] = useState(mockPosts);
  const [stories] = useState(mockStories);

  const currentUser = {
    id: "current-user",
    name: "You",
    username: "your_story",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  };

  const handleStoryClick = (storyId: string) => {
    console.log("Story clicked:", storyId);
    // Here you would typically open the story viewer
  };

  const handleAddStoryClick = () => {
    console.log("Add story clicked");
    // Here you would typically open the story creation interface
  };

  return (
    <div className="flex w-full">
      <div className="w-3/4 md:w-3/4 p-2 md:p-4 lg:p-6 rounded-md max-w-full md:max-w-3xl lg:max-w-5xl">
        <StoriesSection
          stories={stories}
          currentUser={currentUser}
          onStoryClick={handleStoryClick}
          onAddStoryClick={handleAddStoryClick}
        />
        <PostSection
          posts={posts}
          isLoading={false}
          error={null}
          onLoadMore={() => console.log("Load more posts")}
          hasMore={true}
        />
      </div>
      <div className="w-1/4 p-4 mr-8">
        <RightSideBar />
      </div>
    </div>
  );
}
