"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { ProfileSkeleton } from "@/components/skeletons";
import { LoadingWrapper } from "@/components/loading";
import { ProfileInfo, useProfile } from "@/features/profile";
import { useErrorHandler, useAsyncState } from "@/hooks";

export const ProfilePage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const { handleError } = useErrorHandler("ProfilePage");

  const { data: profileData, isLoading, error, refetch } = useProfile(userId);

  // Check if it's current user's profile
  const isOwnProfile = !userId || userId === "me";

  const handleRetry = () => {
    refetch().catch((error: unknown) => {
      handleError(error, { action: "retry_profile", userId } as any);
    });
  };

  // Transform data for LoadingWrapper
  const profileState = {
    data: profileData,
    isLoading,
    error: error?.message || null,
  };

  return (
    <ComponentErrorBoundary componentName="ProfilePage">
      <div className="min-h-screen bg-gray-50">
        <LoadingWrapper
          state={profileState}
          fallback={<ProfileSkeleton />}
          onRetry={handleRetry}
        >
          {(profile) => (
            <>
              <ProfileInfo profileUser={profile} isOwnProfile={isOwnProfile} />

              {/* Profile content sections */}
              <div className="max-w-4xl mx-auto px-4">
                {/* Stories/Highlights section */}
                <div className="mb-8">
                  {/* Story highlights component would go here */}
                </div>

                {/* Posts Grid */}
                <div className="border-t">
                  {/* Posts grid component would go here */}
                  <div className="grid grid-cols-3 gap-1 mt-4">
                    {/* Placeholder for posts */}
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </LoadingWrapper>
      </div>
    </ComponentErrorBoundary>
  );
};
