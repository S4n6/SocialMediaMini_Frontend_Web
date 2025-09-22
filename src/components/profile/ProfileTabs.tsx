"use client";

import React from "react";
import { BsGrid3X3, BsPlayBtn, BsBookmark } from "react-icons/bs";

export type TabType = "posts" | "reels" | "tagged";

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  postCount?: number;
  reelCount?: number;
  taggedCount?: number;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  postCount,
  reelCount,
  taggedCount,
}: ProfileTabsProps) {
  const tabs = [
    {
      id: "posts" as TabType,
      label: "POSTS",
      icon: BsGrid3X3,
      count: postCount,
    },
    {
      id: "reels" as TabType,
      label: "REELS",
      icon: BsPlayBtn,
      count: reelCount,
    },
    {
      id: "tagged" as TabType,
      label: "TAGGED",
      icon: BsBookmark,
      count: taggedCount,
    },
  ];

  return (
    <div className="border-t border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-t-2 transition-colors ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {tab.label}
              </span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs text-gray-400 ml-1">
                  ({tab.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
