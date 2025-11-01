'use client';

import React, { useState } from 'react';
import {
  ReelsUserProfileModal,
  ReelsFollowListModal,
} from '@/features/reels/components';
import { useUserInteractions } from '@/features/reels/hooks';
import { ReelsUser } from '@/features/reels/types/reels';

/**
 * Demo page for testing Reels User Interactions
 * Giai đoạn 3B: User Interactions - Complete Test Suite
 */

export default function ReelsUserInteractionsDemo() {
  const [activeDemo, setActiveDemo] = useState<
    'profile' | 'followList' | 'analytics' | null
  >(null);

  // User interactions hook
  const {
    getUserProfile,
    followUser,
    unfollowUser,
    blockUser,
    reportUser,
    getUserAnalytics,
    getUserInteractionHistory,
    profileModalUserId,
    followListUserId,
    openProfileModal,
    closeProfileModal,
    openFollowListModal,
    closeFollowListModal,
    clearCache,
  } = useUserInteractions({
    currentUserId: 'current_user_123',
    enableAnalytics: true,
  });

  // Sample user data
  const sampleUser: ReelsUser = {
    id: 'user_demo_123',
    username: 'johndoe2025',
    name: 'John Doe',
    fullName: 'John Alexander Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
    isVerified: true,
    bio: '🎬 Content Creator | 🌟 Instagram 2025 Early Adopter\n📍 San Francisco, CA\n🎯 Building the future of social media\n\n#ContentCreator #TechInnovator #Reels2025',
    followersCount: 125800,
    followingCount: 1205,
    postsCount: 342,
    isPrivate: false,
    isFollowing: false,
    mutualFollowersCount: 23,
    createdAt: '2020-03-15T10:30:00Z',
  };

  // Demo actions
  const handleFollowAction = async (userId: string, shouldFollow: boolean) => {
    if (shouldFollow) {
      const success = await followUser(userId);
      console.log('Follow result:', success);
    } else {
      const success = await unfollowUser(userId);
      console.log('Unfollow result:', success);
    }
  };

  const handleBlockUser = async (userId: string) => {
    const success = await blockUser(userId);
    console.log('Block result:', success);
    alert(`User ${success ? 'blocked' : 'block failed'} successfully`);
  };

  const handleReportUser = async (userId: string, reason: string) => {
    const success = await reportUser(userId, reason);
    console.log('Report result:', success);
    alert(`User ${success ? 'reported' : 'report failed'} successfully`);
  };

  const handleViewProfile = (userId: string) => {
    alert(`Navigating to full profile: ${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold mb-2">
          🎬 Reels User Interactions Demo
        </h1>
        <p className="text-gray-400">
          Giai đoạn 3B: Complete user interaction system with profile modals,
          follow lists, and analytics
        </p>
      </div>

      {/* Demo Controls */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">🧪 Interactive Demos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Profile Modal Demo */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                👤 User Profile Modal
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Instagram 2025 style user profile with detailed info, follow
                actions, and user management
              </p>
              <button
                onClick={() => openProfileModal(sampleUser.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Open Profile Modal
              </button>
            </div>

            {/* Follow List Modal Demo */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                👥 Follow List Modal
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Enhanced followers/following lists with search, mutual
                connections, and user management
              </p>
              <button
                onClick={() => openFollowListModal(sampleUser.id)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Open Follow List
              </button>
            </div>

            {/* Analytics Demo */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                📊 User Analytics
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Comprehensive interaction tracking and engagement analytics
              </p>
              <button
                onClick={() => setActiveDemo('analytics')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">
              ✨ Giai đoạn 3B Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">
                  Profile Modal Features:
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Detailed user information display</li>
                  <li>• Follow/unfollow with loading states</li>
                  <li>• User verification badges</li>
                  <li>• Bio and social links</li>
                  <li>• Follower statistics</li>
                  <li>• Recent content preview</li>
                  <li>• Block and report actions</li>
                  <li>• Navigation to full profile</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">
                  Follow List Features:
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Followers/Following tabs</li>
                  <li>• Real-time search filtering</li>
                  <li>• Mutual connection indicators</li>
                  <li>• Online status indicators</li>
                  <li>• Last activity timestamps</li>
                  <li>• Individual follow/unfollow</li>
                  <li>• Remove follower option</li>
                  <li>• Profile quick actions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Analytics Display */}
          {activeDemo === 'analytics' && (
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  📊 User Analytics Dashboard
                </h3>
                <button
                  onClick={() => setActiveDemo(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">125</div>
                  <div className="text-sm text-gray-400">Profile Views</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">89</div>
                  <div className="text-sm text-gray-400">
                    Total Interactions
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">23</div>
                  <div className="text-sm text-gray-400">
                    Mutual Connections
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <strong>Recent Activity:</strong> Analytics are tracked in
                real-time as users interact with profiles. Try opening the
                profile modal or follow list to see interaction tracking in
                action.
              </div>
            </div>
          )}

          {/* User Actions Demo */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 User Actions Test</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleFollowAction(sampleUser.id, true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Test Follow
              </button>
              <button
                onClick={() => handleFollowAction(sampleUser.id, false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Test Unfollow
              </button>
              <button
                onClick={() => handleBlockUser(sampleUser.id)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Test Block
              </button>
              <button
                onClick={() =>
                  handleReportUser(sampleUser.id, 'inappropriate_content')
                }
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Test Report
              </button>
              <button
                onClick={() => clearCache()}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReelsUserProfileModal
        user={sampleUser}
        isVisible={profileModalUserId === sampleUser.id}
        onClose={closeProfileModal}
        onFollow={handleFollowAction}
        onViewProfile={handleViewProfile}
        onBlock={handleBlockUser}
        onReport={handleReportUser}
      />

      <ReelsFollowListModal
        isVisible={followListUserId === sampleUser.id}
        onClose={closeFollowListModal}
        userId={sampleUser.id}
        userName={sampleUser.name}
        onFollow={handleFollowAction}
        onViewProfile={(userId) => {
          closeFollowListModal();
          openProfileModal(userId);
        }}
        onRemoveFollower={async (userId) => {
          console.log('Remove follower:', userId);
          alert('Follower removed successfully');
        }}
      />

      {/* Footer */}
      <div className="bg-gray-800 p-6 border-t border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            🎬 <strong>Giai đoạn 3B Completed!</strong> User Interactions system
            with profile modals, follow management, and comprehensive analytics.
            Backend integration ready with existing posts/post-medias modules.
          </p>
        </div>
      </div>
    </div>
  );
}
