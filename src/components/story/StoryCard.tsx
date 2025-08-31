"use client";

import React from "react";

interface StoryCardProps {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  storyImage: string;
  isViewed: boolean;
}

export default function StoryCard({
  user,
  storyImage,
  isViewed,
}: StoryCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer">
      <div
        className={`relative p-0.5 rounded-full ${
          isViewed
            ? "bg-gray-300 dark:bg-gray-600"
            : "bg-gradient-to-tr from-pink-500 to-orange-500"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 p-0.5 rounded-full">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <img
              src={storyImage}
              alt={`${user.name}'s story`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <span className="text-xs text-center max-w-[70px] truncate">
        {user.username}
      </span>
    </div>
  );
}
