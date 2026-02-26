"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  ProfileInfo,
  StoryHighlights,
  ProfileTabs,
  PostsGrid,
  ProfileErrorState,
  type Highlight,
  type Post,
} from "@/features/profile";
import { useProfilePage } from "@/features/profile/hooks/useProfilePage";
import {
  mockHighlights,
  mockPosts,
  getVideosPosts,
  getTaggedPosts,
} from "@/data/profile-mock";
import { ProfilePageSkeleton } from "@/components/skeletons/ProfilePageSkeleton";
import {
  useProfileRealtimeUpdates,
  useFollowActions,
  usePresence,
} from "@/hooks/useSimpleRealtimeFeatures";
import { useEventBus } from "@/lib/events/EventBus";

export default function ProfilePage() {
  const params = useParams() as { id?: string } | null;
  const profileId = params?.id ?? "me";

  const {
    profileUser,
    activeTab,
    loading,
    error,
    isOwnProfile,
    isLoadingUser,
    handleTabChange,
    refetchProfile,
  } = useProfilePage({ profileId });

  // Real-time features
  useProfileRealtimeUpdates(profileId);
  useFollowActions();
  usePresence();

  // Convert profile user to domain user type
  const convertToDomainUser = (user: unknown) => {
    if (!user || typeof user !== "object") return undefined;
    const userObj = user as Record<string, unknown>;
    return {
      ...userObj,
      fullName: userObj.fullName || undefined,
      bio: userObj.bio || undefined,
      website: userObj.website || undefined,
      location: userObj.location || undefined,
      phoneNumber: userObj.phoneNumber || undefined,
      dateOfBirth: userObj.dateOfBirth || undefined,
      birthDate: userObj.birthDate || undefined,
      googleId: userObj.googleId || undefined,
    };
  };

  // Event bus for cross-component communication
  useEventBus(
    "profile:viewed",
    (data) => {
      if (data.profileId === profileId) {
        console.log("Profile was viewed:", data);
      }
    },
    [profileId]
  );

  const handleHighlightClick = (highlight: Highlight) => {
    console.log("Highlight clicked:", highlight.name || highlight.id);
  };

  const handlePostClick = (post: Post) => {
    console.log("Post clicked:", post.id);
  };

  // Get filtered posts based on active tab
  const getFilteredPosts = () => {
    switch (activeTab) {
      case "posts":
        return mockPosts;
      case "reels":
        return getVideosPosts();
      case "tagged":
        return getTaggedPosts();
      default:
        return mockPosts;
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <ProfileErrorState
        error={error}
        onRetry={refetchProfile}
        type={error.includes("not found") ? "user-not-found" : "network-error"}
      />
    );
  }

  // Show loading skeleton while loading user data
  if (isLoadingUser && !profileUser) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="min-h-screen w-full flex justify-center my-4">
      <div className="w-[80%]">
        {/* Profile Info */}
        <ProfileInfo
          profileUser={convertToDomainUser(profileUser) as any}
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
        <PostsGrid
          posts={getFilteredPosts()}
          onPostClick={handlePostClick}
          loading={loading}
        />
      </div>
    </div>
  );
}
