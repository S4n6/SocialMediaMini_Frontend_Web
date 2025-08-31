import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function FriendSuggestionCard({
  name = "Segun Adebayo",
  username = "segun.adebayo",
  avatarUrl = "https://bit.ly/sage-adebayo",
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Avatar className="w-8 h-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="text-sm font-bold flex-1">
        {name}
        <span className="text-muted-foreground font-normal"> @{username}</span>
      </div>
      <Button variant="outline" size="sm">
        Follow
      </Button>
    </div>
  );
}
