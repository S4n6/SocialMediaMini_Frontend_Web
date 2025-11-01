'use client';

import React, { useState, useCallback } from 'react';
import { ReelsUser } from '../types/reels';

/**
 * Enhanced Follow System for Reels
 * Provides following/followers lists with detailed user management
 */

interface FollowListUser extends ReelsUser {
  mutualCount?: number;
  lastActivity?: string;
  isOnline?: boolean;
}

interface ReelsFollowListModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
  userId: string;
  userName: string;
  onFollow?: (userId: string, isFollowing: boolean) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  onRemoveFollower?: (userId: string) => Promise<void>;
  className?: string;
}

export const ReelsFollowListModal: React.FC<ReelsFollowListModalProps> = ({
  isVisible,
  onClose,
  initialTab = 'followers',
  userId,
  userName,
  onFollow,
  onViewProfile,
  onRemoveFollower,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState<FollowListUser[]>([]);
  const [following, setFollowing] = useState<FollowListUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock data - replace with real API calls
  const mockFollowers: FollowListUser[] = [
    {
      id: 'user1',
      username: 'john_doe',
      name: 'John Doe',
      avatar: '/images/avatars/john.jpg',
      isVerified: true,
      isFollowing: false,
      followersCount: 1250,
      mutualCount: 15,
      lastActivity: '2 hours ago',
      isOnline: true,
    },
    {
      id: 'user2',
      username: 'jane_smith',
      name: 'Jane Smith',
      avatar: '/images/avatars/jane.jpg',
      isVerified: false,
      isFollowing: true,
      followersCount: 890,
      mutualCount: 8,
      lastActivity: '1 day ago',
      isOnline: false,
    },
    {
      id: 'user3',
      username: 'mike_wilson',
      name: 'Mike Wilson',
      avatar: '/images/avatars/mike.jpg',
      isVerified: false,
      isFollowing: false,
      followersCount: 456,
      mutualCount: 3,
      lastActivity: '3 days ago',
      isOnline: true,
    },
  ];

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
  const handleFollowToggle = useCallback(
    async (targetUser: FollowListUser) => {
      if (actionLoading) return;

      try {
        setActionLoading(targetUser.id);
        const newFollowState = !targetUser.isFollowing;

        // Optimistic update
        const updateUser = (user: FollowListUser) =>
          user.id === targetUser.id
            ? { ...user, isFollowing: newFollowState }
            : user;

        setFollowers((prev) => prev.map(updateUser));
        setFollowing((prev) => prev.map(updateUser));

        await onFollow?.(targetUser.id, newFollowState);
      } catch (error) {
        // Revert on error
        const revertUser = (user: FollowListUser) =>
          user.id === targetUser.id
            ? { ...user, isFollowing: targetUser.isFollowing }
            : user;

        setFollowers((prev) => prev.map(revertUser));
        setFollowing((prev) => prev.map(revertUser));

        console.error('Failed to toggle follow:', error);
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading, onFollow],
  );

  // Handle remove follower
  const handleRemoveFollower = useCallback(
    async (targetUserId: string) => {
      if (actionLoading) return;

      try {
        setActionLoading(targetUserId);

        // Remove from followers list
        setFollowers((prev) => prev.filter((user) => user.id !== targetUserId));

        await onRemoveFollower?.(targetUserId);
      } catch (error) {
        // Could revert the removal here
        console.error('Failed to remove follower:', error);
      } finally {
        setActionLoading(null);
      }
    },
    [actionLoading, onRemoveFollower],
  );

  // Filter users based on search
  const filteredUsers = useCallback(
    (users: FollowListUser[]) => {
      if (!searchQuery.trim()) return users;

      const query = searchQuery.toLowerCase();
      return users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query),
      );
    },
    [searchQuery],
  );

  // Get current list based on active tab
  const currentList = activeTab === 'followers' ? followers : following;
  const filteredList = filteredUsers(currentList);

  // Initialize data
  React.useEffect(() => {
    if (isVisible) {
      setFollowers(mockFollowers);
      setFollowing(mockFollowers);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Follow List Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-white text-xl font-semibold">{userName}</h2>

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

        {/* Tabs */}
        <div className="flex border-b border-gray-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'followers'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Followers ({mockFollowers.length})
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'following'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Following ({mockFollowers.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-2.5 text-gray-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-3-3" />
                <path d="m15 12-3-3" />
              </svg>
              <p>No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredList.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => onViewProfile?.(user.id)}
                    >
                      {/* Avatar */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
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

                        {/* Online Indicator */}
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full" />
                        )}
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold truncate">
                            {user.name}
                          </h3>
                          {user.isVerified && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="#1DA1F2"
                            >
                              <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.57-2.11-9.96-5.02-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.14 2.14 4-.79-.02-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.62-.03-.92-.08.62 1.94 2.42 3.35 4.55 3.39-1.67 1.31-3.77 2.09-6.05 2.09-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.55 2.21 9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55-.88.39-1.83.65-2.82.77z" />
                            </svg>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm truncate">
                          @{user.username}
                        </p>

                        {/* Additional Info */}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-xs">
                            {formatCount(user.followersCount || 0)} followers
                          </span>

                          {user.mutualCount && user.mutualCount > 0 && (
                            <span className="text-blue-400 text-xs">
                              {user.mutualCount} mutual
                            </span>
                          )}

                          {user.lastActivity && (
                            <span className="text-gray-500 text-xs">
                              {user.lastActivity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-3">
                      {activeTab === 'followers' && (
                        <button
                          onClick={() => handleRemoveFollower(user.id)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}

                      <button
                        onClick={() => handleFollowToggle(user)}
                        disabled={actionLoading === user.id}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          user.isFollowing
                            ? 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {actionLoading === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : user.isFollowing ? (
                          'Following'
                        ) : (
                          'Follow'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
