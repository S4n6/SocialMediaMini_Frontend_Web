import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FollowButton } from "@/components/ui/FollowButton";

interface FriendSuggestionCardProps {
  userId: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}

export default function FriendSuggestionCard({
  userId,
  name = "User",
  username = "username",
  avatarUrl,
}: FriendSuggestionCardProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-sm font-bold flex flex-col">
          <span>{name}</span>
          <span className="text-muted-foreground font-normal">@{username}</span>
        </div>
      </div>
      <FollowButton targetUserId={userId} variant="ghost" size="sm" />
    </div>
  );
}
