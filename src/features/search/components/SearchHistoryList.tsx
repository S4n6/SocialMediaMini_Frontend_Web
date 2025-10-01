"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchHistoryItem } from "../types/search-history";
import SearchHistoryItemComponent from "./SearchHistoryItem";

interface SearchHistoryListProps {
  history: SearchHistoryItem[];
  isLoading: boolean;
  hasHistory: boolean;
  onItemClick: (item: SearchHistoryItem) => void;
  onItemRemove: (userId: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const SearchHistoryList: React.FC<SearchHistoryListProps> = ({
  history,
  isLoading,
  hasHistory,
  onItemClick,
  onItemRemove,
  onClearAll,
  className,
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Searches
        </h3>
        {hasHistory && (
          <Button
            variant="ghost"
            className="text-blue-500 text-sm p-0 h-auto"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
          </div>
        ) : hasHistory ? (
          history.map((item, index) => (
            <SearchHistoryItemComponent
              key={`${item.userId}-${index}`}
              item={item}
              variant="history"
              onClick={() => onItemClick(item)}
              onRemove={onItemRemove}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">No search history yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Your recent searches will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHistoryList;
