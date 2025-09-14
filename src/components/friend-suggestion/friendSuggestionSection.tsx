import React from "react";
import FriendSuggestionCard from "./friendSuggestionCard";

export default function FriendSuggestionSection() {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Friend Suggestions</h3>
      <div className="flex flex-col gap-8 max-h-[400px] overflow-y-auto">
        <FriendSuggestionCard />
        <FriendSuggestionCard />
        <FriendSuggestionCard />
      </div>
    </div>
  );
}
