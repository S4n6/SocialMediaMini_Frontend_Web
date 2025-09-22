"use client";

import React from "react";
import Image from "next/image";

export interface Highlight {
  id: string;
  name: string;
  imageUrl: string;
  isActive?: boolean;
}

interface StoryHighlightsProps {
  highlights: Highlight[];
  onHighlightClick?: (highlight: Highlight) => void;
}

export default function StoryHighlights({
  highlights,
  onHighlightClick,
}: StoryHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer"
            onClick={() => onHighlightClick?.(highlight)}
          >
            <div
              className={`w-20 h-20 rounded-full overflow-hidden border-2 transition-colors ${
                highlight.isActive
                  ? "border-gray-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={highlight.imageUrl}
                alt={highlight.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 text-center max-w-[64px] truncate">
              {highlight.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
