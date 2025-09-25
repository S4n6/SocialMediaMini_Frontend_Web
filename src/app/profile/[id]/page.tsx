"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ProfileInfo,
  StoryHighlights,
  ProfileTabs,
  PostsGrid,
  type TabType,
  type Highlight,
  type Post,
} from "@/components/profile";
import { useAppSelector } from "@/hooks";
import { User } from "@/types";
import { useGetUserById } from "@/hooks/useUser";

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

export default function ProfilePage() {
  const params = useParams() as { id?: string } | null;
  const userRedux: User | null = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const id = params?.id ?? "me";

  const queryId = id === "me" ? "" : id;
  const { data: user, isLoading, isError } = useGetUserById(queryId);

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

  useEffect(() => {
    if (id === "me" && userRedux) {
      console.log("Setting profile user from Redux", userRedux);
      setProfileUser(userRedux);
    } else if (id !== "me" && user) {
      console.log("Setting profile user from fetched data", user);
      setProfileUser(user as User);
    }
  }, [id, user, userRedux]);

  return (
    <div className="min-h-screen w-full flex justify-center my-4">
      <div className="w-[80%]">
        {/* Profile Info */}
        <ProfileInfo
          avatarUrl={profileUser?.avatar || ""}
          avatarAlt={profileUser?.userName || ""}
          userName={profileUser?.userName || ""}
          stats={
            profileUser?._count ?? { posts: 0, followers: 0, following: 0 }
          }
          displayName={profileUser?.fullName || ""}
          bio={profileUser?.bio || ""}
          website={profileUser?.websiteUrl || ""}
          followedBy={"Khabib, Elon, Jeff"}
          hasStoryRing={false}
          isOwnProfile={id === "me" || id === userRedux?.id}
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
