import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function FriendSuggestionCard({
  name = "Segun Adebayo",
  username = "segun.adebayo",
  avatarUrl = "https://bit.ly/sage-adebayo",
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-sm font-bold flex flex-col">
          <span>{name}</span>
          <span className="text-muted-foreground font-normal">
            {" "}
            @{username}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="p-0">
        Follow
      </Button>
    </div>
  );
}
