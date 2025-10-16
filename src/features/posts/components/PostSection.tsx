"use client";

import React from "react";
import { PostCard } from "./PostCard";
import PostsSkeleton from "./PostsSkeleton";
import type { LegacyPost as Post, ImageItem } from "@/types";

// Export DomainPost alias for compatibility imports
// Note: Use consolidated domain types from @/types when migrating components.

interface PostSectionProps {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function PostSection({
  posts,
  isLoading,
  error,
  onLoadMore,
  hasMore,
}: PostSectionProps) {
  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center p-8">
  //       <div className="text-center">
  //         <p className="text-red-500 mb-2">Error loading posts</p>
  //         <p className="text-sm text-muted-foreground">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading && posts.length === 0) {
    return <PostsSkeleton />;
  }

  return (
    <div className="w-full space-y-4 mt-8">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={(updatedPost) => {
            console.log("Post updated:", updatedPost);
          }}
        />
      ))}

      {isLoading && posts.length > 0 && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex items-center justify-center p-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center p-4">
          <p className="text-sm text-gray-500">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
