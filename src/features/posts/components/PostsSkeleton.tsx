"use client";

import React from "react";

export default function PostsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
        >
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>

          {/* Post Content */}
          <div className="space-y-2 mb-4">
            <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>

          {/* Post Image */}
          <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4" />

          {/* Post Actions */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="ml-auto w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
