"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PaginatedLoadingWrapper } from "@/components/loading";
import { PostListSkeleton } from "@/components/skeletons";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { PostCard, useFeed } from "@/features/posts";
import { useErrorHandler } from "@/hooks";
import type { PaginatedResponse, LegacyPost as Post } from "@/types";

export const FeedPage: React.FC = () => {
  const { handleError } = useErrorHandler({ component: "FeedPage" });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useFeed();

  // Transform infinite query data for the wrapper
  const posts =
    data?.pages?.flatMap(
      (page) => (page as unknown as PaginatedResponse<Post>).data
    ) || [];
  const lastPage = data?.pages?.[data.pages.length - 1] as
    | (PaginatedResponse<Post> | undefined)
    | undefined;

  const feedState = {
    data: posts,
    pagination: lastPage?.pagination || null,
    isLoading,
    error: error?.message || null,
    hasMore: hasNextPage || false,
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch((error) => {
        handleError(error, { action: "load_more_posts" });
      });
    }
  };

  const handleRetry = () => {
    refetch().catch((error) => {
      handleError(error, { action: "retry_feed" });
    });
  };

  return (
    <ComponentErrorBoundary componentName="FeedPage">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

        <PaginatedLoadingWrapper
          state={feedState}
          fallback={<PostListSkeleton count={5} />}
          onRetry={handleRetry}
          onLoadMore={handleLoadMore}
        >
          {(posts) => (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={(updatedPost) => {
                    // Handle post updates if needed
                    console.log("Post updated:", updatedPost);
                  }}
                />
              ))}
            </div>
          )}
        </PaginatedLoadingWrapper>
      </div>
    </ComponentErrorBoundary>
  );
};
