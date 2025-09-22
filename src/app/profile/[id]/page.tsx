"use client";

import React, { useState, useEffect } from "react";
import {
  ProfileInfo,
  StoryHighlights,
  ProfileTabs,
  PostsGrid,
  type TabType,
  type Highlight,
  type Post,
} from "@/components/profile";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock data - in real app, this would come from API
const mockProfileData = {
  username: "mkbhd",
  isVerified: true,
  isFollowing: true,
  displayName: "Marques Brownlee",
  bio: "I promise I won't overdo the filters.",
  website: "mkbhd.com",
  followedBy: "kurgezagt",
  avatarUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg/500px-20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg",
  hasStoryRing: true,
  stats: {
    posts: 1861,
    followers: 4000000,
    following: 454,
  },
};

const mockHighlights: Highlight[] = [
  {
    id: "1",
    name: "BTS",
    imageUrl: "https://picsum.photos/80/80?random=10",
  },
  {
    id: "2",
    name: "Frisbee",
    imageUrl: "https://picsum.photos/80/80?random=11",
  },
];

const mockPosts: Post[] = [
  {
    id: "1",
    imageUrl: "https://picsum.photos/400/400?random=1",
    isVideo: false,
    likes: 1234,
    comments: 89,
    caption: "Beautiful sunset at the beach",
  },
  {
    id: "2",
    imageUrl: "https://picsum.photos/400/400?random=2",
    isVideo: true,
    likes: 2156,
    comments: 178,
    caption: "Training session highlights",
  },
  {
    id: "3",
    imageUrl: "https://picsum.photos/400/400?random=3",
    isVideo: false,
    isCarousel: true,
    likes: 892,
    comments: 45,
    caption: "Team celebration after victory",
  },
  {
    id: "4",
    imageUrl: "https://picsum.photos/400/400?random=4",
    isVideo: false,
    likes: 1567,
    comments: 234,
  },
  {
    id: "5",
    imageUrl: "https://picsum.photos/400/400?random=5",
    isVideo: true,
    likes: 3421,
    comments: 567,
  },
  {
    id: "6",
    imageUrl: "https://picsum.photos/400/400?random=6",
    isVideo: false,
    likes: 987,
    comments: 123,
  },
];

export default function ProfilePage({ params }: ProfilePageProps) {
  const [id, setId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const isOwnProfile = id === "me" || id === "own" || id === "self";

  const handleHighlightClick = (highlight: Highlight) => {
    console.log("Highlight clicked:", highlight.name);
  };

  const handlePostClick = (post: Post) => {
    console.log("Post clicked:", post.id);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen w-full flex justify-center my-4">
      <div className="w-[80%]">
        {/* Profile Info */}
        <ProfileInfo
          avatarUrl={mockProfileData.avatarUrl}
          avatarAlt={mockProfileData.displayName}
          avatarFallback="MK"
          stats={mockProfileData.stats}
          displayName={mockProfileData.displayName}
          bio={mockProfileData.bio}
          website={mockProfileData.website}
          followedBy={mockProfileData.followedBy}
          hasStoryRing={mockProfileData.hasStoryRing}
          isOwnProfile={isOwnProfile}
        />

        {/* Story Highlights */}
        <StoryHighlights
          highlights={mockHighlights}
          onHighlightClick={handleHighlightClick}
        />

        {/* Tab Navigation */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          postCount={mockPosts.length}
          reelCount={mockPosts.filter((p) => p.isVideo).length}
          taggedCount={0}
        />

        {/* Content based on active tab */}
        {activeTab === "posts" && (
          <PostsGrid
            posts={mockPosts}
            onPostClick={handlePostClick}
            loading={loading}
          />
        )}

        {activeTab === "reels" && (
          <PostsGrid
            posts={mockPosts.filter((p) => p.isVideo)}
            onPostClick={handlePostClick}
            loading={loading}
          />
        )}

        {activeTab === "tagged" && (
          <PostsGrid
            posts={[]}
            onPostClick={handlePostClick}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
