"use client";

import React from "react";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";

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
  isAddStory?: boolean;
  onClick?: () => void;
}

export default function StoryCard({
  user,
  storyImage,
  isViewed,
  isAddStory = false,
  onClick,
}: StoryCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 min-w-[80px]"
      onClick={onClick}
    >
      <div
        className={`relative p-0.5 rounded-full ${
          isAddStory
            ? "bg-gray-300 dark:bg-gray-600"
            : isViewed
            ? "bg-gray-300 dark:bg-gray-600"
            : "bg-gradient-to-tr from-pink-500 to-orange-500"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 p-0.5 rounded-full">
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image
              src={storyImage}
              alt={`${user.name}'s story`}
              fill
              className="object-cover"
              sizes="80px"
            />
            {isAddStory && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-blue-500 rounded-full p-1">
                  <FaPlus className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-center max-w-[80px] truncate">
        {isAddStory ? "Your story" : user.username}
      </span>
    </div>
  );
}
