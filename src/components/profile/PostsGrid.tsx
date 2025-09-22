"use client";

import React from "react";
import Image from "next/image";
import { BsPlayBtn, BsCollection } from "react-icons/bs";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";

export interface Post {
  id: string;
  imageUrl: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  likes: number;
  comments: number;
  caption?: string;
}

interface PostsGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  loading?: boolean;
}

export default function PostsGrid({
  posts,
  onPostClick,
  loading = false,
}: PostsGridProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4">
          <BsCollection className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-xl font-light text-gray-600 mb-2">No Posts Yet</h3>
        <p className="text-sm text-gray-400 text-center">
          When you share photos and videos, they will appear on your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square group cursor-pointer overflow-hidden"
          onClick={() => onPostClick?.(post)}
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || `Post ${post.id}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
          />

          {/* Media type indicators */}
          <div className="absolute top-2 right-2 flex gap-1">
            {post.isVideo && (
              <div className="bg-black bg-opacity-60 rounded-full p-1">
                <BsPlayBtn className="w-3 h-3 text-white" />
              </div>
            )}
            {post.isCarousel && (
              <div className="bg-black bg-opacity-60 rounded-full p-1">
                <BsCollection className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Hover overlay with stats */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <AiFillHeart className="w-5 h-5" />
                <span className="font-semibold">
                  {formatNumber(post.likes)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaComment className="w-5 h-5" />
                <span className="font-semibold">
                  {formatNumber(post.comments)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
