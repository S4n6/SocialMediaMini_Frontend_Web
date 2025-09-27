"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  userName: string;
  fullName?: string | null;
  avatar?: string | null;
}

interface SearchResultsProps {
  query: string;
  results: User[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onUserClick: (userId: string) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  isError,
  error,
  onUserClick,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`text-sm text-red-500 text-center py-4 ${className}`}>
        Error: {error?.message || "Something went wrong"}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-sm text-gray-500 text-center py-4 ${className}`}>
        No users found for &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {results.map((user, index) => (
        <div
          key={user.id || index}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
          onClick={() => onUserClick(user.id)}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar || ""} />
            <AvatarFallback>
              {(user.fullName || user.userName)?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.userName}</p>
            <p className="text-sm text-gray-500 truncate">{user.fullName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
