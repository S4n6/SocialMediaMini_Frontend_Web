import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileInfoSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-6">
      {/* Avatar Skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
      </div>

      {/* Profile Info Skeleton */}
      <div className="flex-grow space-y-4">
        {/* Username and buttons row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Stats row */}
        <div className="flex gap-6">
          <div className="flex gap-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        {/* Display name */}
        <Skeleton className="h-5 w-40" />

        {/* Bio lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Website */}
        <Skeleton className="h-4 w-32" />

        {/* Followed by */}
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
};

export const StoryHighlightsSkeleton: React.FC = () => {
  return (
    <div className="px-6 py-4">
      <div className="flex gap-4 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileTabsSkeleton: React.FC = () => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-center">
        <div className="flex gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 py-4">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PostsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="aspect-square">
          <Skeleton className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};

export const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex justify-center my-4">
      <div className="w-[80%]">
        <ProfileInfoSkeleton />
        <StoryHighlightsSkeleton />
        <ProfileTabsSkeleton />
        <PostsGridSkeleton />
      </div>
    </div>
  );
};

export default ProfilePageSkeleton;
