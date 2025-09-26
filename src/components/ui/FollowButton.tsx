import React from "react";
import { Button } from "@/components/ui/button";
import { useFollowActions } from "@/hooks";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  followText?: string;
  followingText?: string;
  showLoading?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  variant = "default",
  size = "sm",
  className = "",
  followText = "Follow",
  followingText = "Following",
  showLoading = true,
}) => {
  const { isFollowing, isLoading, toggleFollow, error } =
    useFollowActions(targetUserId);

  const getButtonStyle = () => {
    if (variant === "ghost") {
      return "p-0";
    }

    if (variant === "outline" || isFollowing) {
      return "bg-white border-gray-300 text-black hover:bg-gray-50";
    }

    return "bg-blue-500 hover:bg-blue-600 text-white border-0";
  };

  const getButtonVariant = () => {
    if (variant === "ghost") {
      return "ghost";
    }

    return isFollowing ? "outline" : "default";
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      className={`text-sm font-medium px-4 ${getButtonStyle()} ${className}`}
      onClick={toggleFollow}
      disabled={isLoading}
    >
      {showLoading && isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {isFollowing ? followingText : followText}
    </Button>
  );
};
