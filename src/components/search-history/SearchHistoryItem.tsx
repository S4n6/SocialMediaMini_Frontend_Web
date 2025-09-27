"use client";

import React from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHistoryItem as SearchHistoryItemType } from "@/types/search-history";

interface SearchHistoryItemProps {
  item: SearchHistoryItemType;
  onClick: () => void;
  onRemove: (userId: string) => void;
  variant?: "history" | "suggestion";
}

export const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({
  item,
  onClick,
  onRemove,
  variant = "history",
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group">
      <div className="w-11 h-11">
        {item.user.avatar ? (
          <img
            src={item.user.avatar}
            alt={item.user.fullName}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className={`w-11 h-11 flex items-center justify-center rounded-full ${
              variant === "suggestion" ? "bg-blue-100" : "bg-gray-200"
            }`}
          >
            <span
              className={`text-sm font-medium ${
                variant === "suggestion" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {item.user.fullName?.charAt(0) ||
                item.user.userName?.charAt(0) ||
                "U"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1" onClick={onClick}>
        <p className="text-sm font-medium truncate">{item.user.userName}</p>
        <p className="text-xs text-gray-500 truncate">{item.user.fullName}</p>
      </div>

      {variant === "history" && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.userId);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchHistoryItem;
