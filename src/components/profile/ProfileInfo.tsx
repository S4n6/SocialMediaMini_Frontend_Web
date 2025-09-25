"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { IoPersonAddOutline, IoSettingsOutline } from "react-icons/io5";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProfileInfoProps {
  followedBy?: string;
  hasStoryRing?: boolean;
  isOwnProfile?: boolean;
  // optional props to allow page to pass mocked or server data
  avatarUrl?: string;
  avatarAlt?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
  displayName?: string;
  bio?: string;
  website?: string;
  userName?: string;
}

export default function ProfileInfo({
  followedBy,
  hasStoryRing = false,
  isOwnProfile = false,
  avatarUrl,
  avatarAlt,
  stats,
  displayName,
  bio,
  website,
  userName,
}: ProfileInfoProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isFollowing, setIsFollowing] = React.useState(false);

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
  };
  const handleMessageClick = () => {
    console.log("Message clicked");
  };
  const handleEditProfileClick = () => {
    router.push("/profile/edit");
  };
  const handleViewArchiveClick = () => {
    console.log("View archive clicked");
  };
  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };
  return (
    <div className="w-full flex justify-center items-center gap-24 my-8">
      {/* Profile Picture */}
      <div className="">
        <Avatar
          className="w-40 h-40"
          style={
            hasStoryRing
              ? {
                  background: "var(--color-accent-gradient)",
                  padding: "3px",
                  borderRadius: "50%",
                }
              : {}
          }
        >
          <AvatarImage
            src={(isOwnProfile && user?.avatar) || avatarUrl || ""}
            alt={avatarAlt || user?.userName || "User Avatar"}
            className="object-cover w-full h-full rounded-full bg-gray-300"
            style={hasStoryRing ? { border: "2px solid white" } : {}}
          />
          <AvatarFallback className="text-lg font-semibold">
            {(displayName ?? user?.fullName)?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-start gap-6">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <span className="font-semibold mr-4">
            {userName || user?.userName}
          </span>
          {isOwnProfile ? (
            // Own profile buttons
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-medium px-4 bg-white border-gray-300 text-black hover:bg-gray-50"
                onClick={handleEditProfileClick}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-medium px-4 bg-white border-gray-300 text-black hover:bg-gray-50"
                onClick={handleViewArchiveClick}
              >
                View Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-gray-50"
                onClick={handleSettingsClick}
              >
                <IoSettingsOutline className="w-4 h-4" />
              </Button>
            </>
          ) : (
            // Other user profile buttons
            <>
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className={`text-sm font-medium px-4 ${
                  isFollowing
                    ? "bg-white border-gray-300 text-black hover:bg-gray-50"
                    : "bg-blue-500 hover:bg-blue-600 text-white border-0"
                }`}
                onClick={handleFollowClick}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-medium px-4 bg-white border-gray-300 text-black hover:bg-gray-50"
                onClick={handleMessageClick}
              >
                Message
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-gray-50"
                onClick={() => console.log("Add person clicked")}
              >
                <IoPersonAddOutline className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-gray-50"
                onClick={() => console.log("More options clicked")}
              >
                <HiOutlineDotsHorizontal className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="w-full">
          <div className="w-full flex justify-around text-center gap-4">
            <div>
              <div className="font-semibold text-lg">
                {formatNumber(stats?.posts ?? user?._count?.posts ?? 0)}
              </div>
              <span className="text-sm text-gray-500">posts</span>
            </div>
            <div>
              <div className="font-semibold text-lg">
                {formatNumber(stats?.followers ?? user?._count?.followers ?? 0)}
              </div>
              <span className="text-sm text-gray-500">followers</span>
            </div>
            <div>
              <div className="font-semibold text-lg">
                {formatNumber(stats?.following ?? user?._count?.following ?? 0)}
              </div>
              <span className="text-sm text-gray-500">following</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-4">
          <div className="font-semibold text-sm">
            {displayName ?? user?.fullName}
          </div>
          {(bio ?? user?.bio) && (
            <div className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {bio ?? user?.bio}
            </div>
          )}
          {(website ?? user?.websiteUrl) && (
            <div className="text-sm text-blue-600 mt-1 hover:underline cursor-pointer">
              {website ?? user?.websiteUrl}
            </div>
          )}
          {followedBy && (
            <div className="text-xs text-gray-500 mt-2">
              Followed by{" "}
              <span className="font-semibold text-gray-700">{followedBy}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};
