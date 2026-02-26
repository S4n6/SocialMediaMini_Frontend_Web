"use client";

import React from "react";
import { Clock } from "lucide-react";
import { SearchHistoryItem } from "../types/search-history";
import SearchHistoryItemComponent from "./SearchHistoryItem";

interface SearchSuggestionsProps {
  suggestions: SearchHistoryItem[];
  onSuggestionClick: (item: SearchHistoryItem) => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  className,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Suggestions
      </h3>
      <div className="space-y-1">
        {suggestions.map((item, index) => (
          <SearchHistoryItemComponent
            key={`suggestion-${index}`}
            item={item}
            variant="suggestion"
            onClick={() => onSuggestionClick(item)}
            onRemove={() => {}} // No remove for suggestions
          />
        ))}
      </div>
    </div>
  );
};

export default SearchSuggestions;
