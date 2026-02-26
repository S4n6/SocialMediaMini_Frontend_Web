"use client";

import React from "react";

export default function StoriesSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto p-4">
      {/* Current User Story */}
      <div className="flex flex-col items-center gap-2 min-w-[80px]">
        <div className="relative p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="bg-white dark:bg-gray-900 p-0.5 rounded-full">
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      </div>

      {/* Story Skeletons */}
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 min-w-[80px]"
        >
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 animate-pulse">
            <div className="bg-white dark:bg-gray-900 p-0.5 rounded-full">
              <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
            </div>
          </div>
          <div className="w-12 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
