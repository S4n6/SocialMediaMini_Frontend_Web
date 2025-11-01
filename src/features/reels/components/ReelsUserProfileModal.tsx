'use client';

import React, { useState, useCallback } from 'react';
import { ReelsUser } from '../types/reels';

/**
 * User Profile Modal - Instagram 2025 style
 * Shows detailed user info, follow button, and user's content
 */

interface ReelsUserProfileModalProps {
  user: ReelsUser;
  isVisible: boolean;
  onClose: () => void;
  onFollow?: (userId: string, isFollowing: boolean) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  onBlock?: (userId: string) => Promise<void>;
  onReport?: (userId: string, reason: string) => Promise<void>;
  className?: string;
}

export const ReelsUserProfileModal: React.FC<ReelsUserProfileModalProps> = ({
  user,
  isVisible,
  onClose,
  onFollow,
  onViewProfile,
  onBlock,
  onReport,
  className = '',
}) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Format follower count
  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  // Handle follow toggle
  const handleFollowToggle = useCallback(async () => {
    if (isFollowLoading) return;

    try {
      setIsFollowLoading(true);
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);

      await onFollow?.(user.id, newFollowState);
    } catch (error) {
      // Revert on error
      setIsFollowing(!isFollowing);
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  }, [isFollowing, isFollowLoading, user.id, onFollow]);

  // Handle view full profile
  const handleViewProfile = useCallback(() => {
    onViewProfile?.(user.id);
    onClose();
  }, [user.id, onViewProfile, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Profile Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl animate-slide-up max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold text-lg">
                  {user.name}
                </h3>
                {user.isVerified && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#1DA1F2"
                  >
                    <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.57-2.11-9.96-5.02-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.14 2.14 4-.79-.02-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.62-.03-.92-.08.62 1.94 2.42 3.35 4.55 3.39-1.67 1.31-3.77 2.09-6.05 2.09-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55-.88.39-1.83.65-2.82.77z" />
                  </svg>
                )}
              </div>
              <p className="text-gray-400 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>

            {/* Actions Dropdown */}
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-10">
                <button
                  onClick={handleViewProfile}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  View Full Profile
                </button>
                <button
                  onClick={() => onBlock?.(user.id)}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors"
                >
                  Block User
                </button>
                <button
                  onClick={() => onReport?.(user.id, 'inappropriate')}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors"
                >
                  Report User
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {/* Bio */}
          {user.bio && (
            <div className="mb-4">
              <p className="text-white text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-white text-xl font-bold">
                {formatCount(user.followersCount || 0)}
              </div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>

            <div className="text-center">
              <div className="text-white text-xl font-bold">
                {formatCount(user.followingCount || 0)}
              </div>
              <div className="text-gray-400 text-sm">Following</div>
            </div>

            <div className="text-center">
              <div className="text-white text-xl font-bold">
                {formatCount(user.postsCount || 0)}
              </div>
              <div className="text-gray-400 text-sm">Posts</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            {/* Follow/Unfollow Button */}
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                isFollowing
                  ? 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {isFollowLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>

            {/* Message Button */}
            <button className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 transition-colors">
              Message
            </button>
          </div>

          {/* Additional Info */}
          <div className="space-y-3">
            {/* Account Type */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Account Type</span>
              <span className="text-white">
                {user.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            {/* Joined Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Joined</span>
              <span className="text-white">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Recently'}
              </span>
            </div>

            {/* Mutual Followers */}
            {user.mutualFollowersCount && user.mutualFollowersCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Mutual Followers</span>
                <span className="text-blue-400">
                  {formatCount(user.mutualFollowersCount)} mutual
                </span>
              </div>
            )}
          </div>

          {/* Recent Content Preview */}
          <div className="mt-6">
            <h4 className="text-white font-semibold mb-3">Recent Content</h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Placeholder for user's recent posts/reels */}
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-500"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};
