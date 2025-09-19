import React from "react";
import FriendSuggestionCard from "./friendSuggestionCard";

export default function FriendSuggestionSection() {
  return (
    <div className="w-full">
      <div className="flex w-full justify-between items-center mb-4">
        <span className="text-sm">Friend suggestions for you</span>
        <span className="text-sm font-bold">See all</span>
      </div>
      <div className="flex w-full flex-col space-y-8 overflow-y-auto">
        <FriendSuggestionCard />
        <FriendSuggestionCard />
        <FriendSuggestionCard />
      </div>
    </div>
  );
}
