"use client";

import React from "react";
import { PostCard } from "./PostCard";
import { ImageItem } from "../ui/image-list-custom";

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  images?: ImageItem[];
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  shares?: number;
}

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
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading posts</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={(updatedPost) => {
            console.log("Post updated:", updatedPost);
          }}
        />
      ))}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex items-center justify-center p-4">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Load More Posts
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
