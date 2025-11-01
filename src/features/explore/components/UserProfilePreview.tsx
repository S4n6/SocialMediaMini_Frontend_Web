'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  UserPlus,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';

interface UserProfilePreviewProps {
  user: {
    id: string;
    username: string;
    fullName?: string;
    avatar?: string;
    isVerified: boolean;
    bio?: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
    isPrivate?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onFollow: (userId: string) => void;
  onMessage: (userId: string) => void;
  onViewProfile: (username: string) => void;
}

export const UserProfilePreview: React.FC<UserProfilePreviewProps> = ({
  user,
  isOpen,
  onClose,
  onFollow,
  onMessage,
  onViewProfile,
}) => {
  if (!isOpen) return null;

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow(user.id);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage(user.id);
  };

  const handleViewProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(user.username);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-transparent z-40" onClick={onClose} />

      {/* Profile Preview Card */}
      <div className="absolute z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 p-6 transform -translate-x-1/2 translate-y-2">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.username}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xl font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {user.username}
            </h3>
            {user.fullName && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {user.fullName}
              </p>
            )}

            {user.isPrivate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mt-1">
                🔒 Private
              </span>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4 py-3 border-y border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCount(user.postsCount)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Posts
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCount(user.followersCount)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Followers
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCount(user.followingCount)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Following
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {user.bio}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleFollowClick}
            variant={user.isFollowing ? 'outline' : 'default'}
            size="sm"
            className="flex-1"
          >
            {user.isFollowing ? (
              <>
                <UserCheck size={16} className="mr-2" />
                Following
              </>
            ) : (
              <>
                <UserPlus size={16} className="mr-2" />
                Follow
              </>
            )}
          </Button>

          <Button
            onClick={handleMessageClick}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <MessageCircle size={16} className="mr-2" />
            Message
          </Button>
        </div>

        {/* View Profile Button */}
        <Button
          onClick={handleViewProfileClick}
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-blue-600 hover:text-blue-700"
        >
          View Profile
        </Button>
      </div>
    </>
  );
};
