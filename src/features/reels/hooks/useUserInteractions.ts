'use client';

import { useState, useCallback, useEffect } from 'react';
import { ReelsUser } from '../types/reels';

/**
 * Enhanced User Interactions Hook for Reels
 * Manages user relationships, profile viewing, and interaction analytics
 */

export interface UserInteractionAnalytics {
  profileViews: number;
  totalInteractions: number;
  followersGained: number;
  followersLost: number;
  mutualConnections: number;
  engagementScore: number; // 0-100
  lastActiveAt: string;
  averageSessionTime: number; // in minutes
}

export interface UserRelationshipStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutualFollow: boolean;
  isBlocked: boolean;
  isRestricted: boolean;
  relationshipType:
    | 'none'
    | 'following'
    | 'follower'
    | 'mutual'
    | 'blocked'
    | 'restricted';
}

export interface UserInteractionHistory {
  id: string;
  type:
    | 'like'
    | 'comment'
    | 'share'
    | 'save'
    | 'follow'
    | 'unfollow'
    | 'block'
    | 'report';
  videoId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface UseUserInteractionsProps {
  currentUserId?: string;
  enableAnalytics?: boolean;
  cacheTimeout?: number; // in milliseconds
}

export const useUserInteractions = ({
  currentUserId,
  enableAnalytics = true,
  cacheTimeout = 5 * 60 * 1000, // 5 minutes
}: UseUserInteractionsProps = {}) => {
  // State management
  const [userProfiles, setUserProfiles] = useState<Map<string, ReelsUser>>(
    new Map(),
  );
  const [relationshipStatus, setRelationshipStatus] = useState<
    Map<string, UserRelationshipStatus>
  >(new Map());
  const [interactionHistory, setInteractionHistory] = useState<
    Map<string, UserInteractionHistory[]>
  >(new Map());
  const [analytics, setAnalytics] = useState<
    Map<string, UserInteractionAnalytics>
  >(new Map());
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map());
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(
    null,
  );
  const [followListUserId, setFollowListUserId] = useState<string | null>(null);

  // Cache management
  const [cacheTimestamps, setCacheTimestamps] = useState<Map<string, number>>(
    new Map(),
  );

  // Check if cache is valid
  const isCacheValid = useCallback(
    (userId: string) => {
      const timestamp = cacheTimestamps.get(userId);
      if (!timestamp) return false;
      return Date.now() - timestamp < cacheTimeout;
    },
    [cacheTimeout, cacheTimestamps],
  );

  // Get user profile
  const getUserProfile = useCallback(
    async (userId: string): Promise<ReelsUser | null> => {
      try {
        // Check cache first
        if (isCacheValid(userId) && userProfiles.has(userId)) {
          return userProfiles.get(userId) || null;
        }

        setLoading((prev) => new Map(prev).set(userId, true));

        // Mock API call - replace with real API
        const mockProfile: ReelsUser = {
          id: userId,
          username: `user_${userId}`,
          name: `User ${userId}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          isVerified: Math.random() > 0.8,
          bio: `This is a bio for user ${userId}`,
          followersCount: Math.floor(Math.random() * 10000),
          followingCount: Math.floor(Math.random() * 1000),
          postsCount: Math.floor(Math.random() * 500),
          isPrivate: Math.random() > 0.9,
          mutualFollowersCount: Math.floor(Math.random() * 50),
          createdAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };

        // Update cache
        setUserProfiles((prev) => new Map(prev).set(userId, mockProfile));
        setCacheTimestamps((prev) => new Map(prev).set(userId, Date.now()));

        return mockProfile;
      } catch (error) {
        console.error('Failed to get user profile:', error);
        return null;
      } finally {
        setLoading((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, false);
          return newMap;
        });
      }
    },
    [isCacheValid, userProfiles],
  );

  // Get relationship status
  const getRelationshipStatus = useCallback(
    async (userId: string): Promise<UserRelationshipStatus> => {
      try {
        if (
          isCacheValid(`relationship_${userId}`) &&
          relationshipStatus.has(userId)
        ) {
          return relationshipStatus.get(userId)!;
        }

        // Mock API call
        const isFollowing = Math.random() > 0.5;
        const isFollowedBy = Math.random() > 0.5;
        const isMutualFollow = isFollowing && isFollowedBy;

        const status: UserRelationshipStatus = {
          isFollowing,
          isFollowedBy,
          isMutualFollow,
          isBlocked: false,
          isRestricted: false,
          relationshipType: isMutualFollow
            ? 'mutual'
            : isFollowing
              ? 'following'
              : isFollowedBy
                ? 'follower'
                : 'none',
        };

        setRelationshipStatus((prev) => new Map(prev).set(userId, status));
        setCacheTimestamps((prev) =>
          new Map(prev).set(`relationship_${userId}`, Date.now()),
        );

        return status;
      } catch (error) {
        console.error('Failed to get relationship status:', error);
        return {
          isFollowing: false,
          isFollowedBy: false,
          isMutualFollow: false,
          isBlocked: false,
          isRestricted: false,
          relationshipType: 'none',
        };
      }
    },
    [isCacheValid, relationshipStatus],
  );

  // Follow user
  const followUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        setLoading((prev) => new Map(prev).set(`follow_${userId}`, true));

        // Optimistic update
        setRelationshipStatus((prev) => {
          const current = prev.get(userId);
          if (current) {
            const updated = {
              ...current,
              isFollowing: true,
              isMutualFollow: current.isFollowedBy,
              relationshipType: current.isFollowedBy
                ? ('mutual' as const)
                : ('following' as const),
            };
            return new Map(prev).set(userId, updated);
          }
          return prev;
        });

        // Update user profile follower count
        setUserProfiles((prev) => {
          const user = prev.get(userId);
          if (user) {
            return new Map(prev).set(userId, {
              ...user,
              followersCount: (user.followersCount || 0) + 1,
            });
          }
          return prev;
        });

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Track interaction
        if (enableAnalytics) {
          trackInteraction(userId, {
            id: `follow_${Date.now()}`,
            type: 'follow',
            timestamp: new Date().toISOString(),
          });
        }

        return true;
      } catch (error) {
        // Revert optimistic update
        getRelationshipStatus(userId);
        console.error('Failed to follow user:', error);
        return false;
      } finally {
        setLoading((prev) => {
          const newMap = new Map(prev);
          newMap.delete(`follow_${userId}`);
          return newMap;
        });
      }
    },
    [enableAnalytics, getRelationshipStatus],
  );

  // Unfollow user
  const unfollowUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        setLoading((prev) => new Map(prev).set(`unfollow_${userId}`, true));

        // Optimistic update
        setRelationshipStatus((prev) => {
          const current = prev.get(userId);
          if (current) {
            const updated = {
              ...current,
              isFollowing: false,
              isMutualFollow: false,
              relationshipType: current.isFollowedBy
                ? ('follower' as const)
                : ('none' as const),
            };
            return new Map(prev).set(userId, updated);
          }
          return prev;
        });

        // Update user profile follower count
        setUserProfiles((prev) => {
          const user = prev.get(userId);
          if (user) {
            return new Map(prev).set(userId, {
              ...user,
              followersCount: Math.max((user.followersCount || 0) - 1, 0),
            });
          }
          return prev;
        });

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Track interaction
        if (enableAnalytics) {
          trackInteraction(userId, {
            id: `unfollow_${Date.now()}`,
            type: 'unfollow',
            timestamp: new Date().toISOString(),
          });
        }

        return true;
      } catch (error) {
        // Revert optimistic update
        getRelationshipStatus(userId);
        console.error('Failed to unfollow user:', error);
        return false;
      } finally {
        setLoading((prev) => {
          const newMap = new Map(prev);
          newMap.delete(`unfollow_${userId}`);
          return newMap;
        });
      }
    },
    [enableAnalytics, getRelationshipStatus],
  );

  // Block user
  const blockUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        setLoading((prev) => new Map(prev).set(`block_${userId}`, true));

        // Update relationship status
        setRelationshipStatus((prev) =>
          new Map(prev).set(userId, {
            isFollowing: false,
            isFollowedBy: false,
            isMutualFollow: false,
            isBlocked: true,
            isRestricted: false,
            relationshipType: 'blocked',
          }),
        );

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Track interaction
        if (enableAnalytics) {
          trackInteraction(userId, {
            id: `block_${Date.now()}`,
            type: 'block',
            timestamp: new Date().toISOString(),
          });
        }

        return true;
      } catch (error) {
        console.error('Failed to block user:', error);
        return false;
      } finally {
        setLoading((prev) => {
          const newMap = new Map(prev);
          newMap.delete(`block_${userId}`);
          return newMap;
        });
      }
    },
    [enableAnalytics],
  );

  // Report user
  const reportUser = useCallback(
    async (userId: string, reason: string): Promise<boolean> => {
      try {
        setLoading((prev) => new Map(prev).set(`report_${userId}`, true));

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Track interaction
        if (enableAnalytics) {
          trackInteraction(userId, {
            id: `report_${Date.now()}`,
            type: 'report',
            timestamp: new Date().toISOString(),
            metadata: { reason },
          });
        }

        return true;
      } catch (error) {
        console.error('Failed to report user:', error);
        return false;
      } finally {
        setLoading((prev) => {
          const newMap = new Map(prev);
          newMap.delete(`report_${userId}`);
          return newMap;
        });
      }
    },
    [enableAnalytics],
  );

  // Track interaction
  const trackInteraction = useCallback(
    (userId: string, interaction: UserInteractionHistory) => {
      if (!enableAnalytics) return;

      setInteractionHistory((prev) => {
        const history = prev.get(userId) || [];
        return new Map(prev).set(userId, [
          interaction,
          ...history.slice(0, 99),
        ]); // Keep last 100
      });

      // Update analytics
      setAnalytics((prev) => {
        const current = prev.get(userId) || {
          profileViews: 0,
          totalInteractions: 0,
          followersGained: 0,
          followersLost: 0,
          mutualConnections: 0,
          engagementScore: 0,
          lastActiveAt: new Date().toISOString(),
          averageSessionTime: 0,
        };

        const updated = {
          ...current,
          totalInteractions: current.totalInteractions + 1,
          followersGained:
            interaction.type === 'follow'
              ? current.followersGained + 1
              : current.followersGained,
          followersLost:
            interaction.type === 'unfollow'
              ? current.followersLost + 1
              : current.followersLost,
          lastActiveAt: new Date().toISOString(),
        };

        return new Map(prev).set(userId, updated);
      });
    },
    [enableAnalytics],
  );

  // View profile (track analytics)
  const viewProfile = useCallback(
    async (userId: string) => {
      if (enableAnalytics) {
        setAnalytics((prev) => {
          const current = prev.get(userId) || {
            profileViews: 0,
            totalInteractions: 0,
            followersGained: 0,
            followersLost: 0,
            mutualConnections: 0,
            engagementScore: 0,
            lastActiveAt: new Date().toISOString(),
            averageSessionTime: 0,
          };

          return new Map(prev).set(userId, {
            ...current,
            profileViews: current.profileViews + 1,
          });
        });
      }

      // Get user profile to cache it
      await getUserProfile(userId);
    },
    [enableAnalytics, getUserProfile],
  );

  // Modal management
  const openProfileModal = useCallback(
    (userId: string) => {
      setProfileModalUserId(userId);
      viewProfile(userId);
    },
    [viewProfile],
  );

  const closeProfileModal = useCallback(() => {
    setProfileModalUserId(null);
  }, []);

  const openFollowListModal = useCallback((userId: string) => {
    setFollowListUserId(userId);
  }, []);

  const closeFollowListModal = useCallback(() => {
    setFollowListUserId(null);
  }, []);

  // Get user analytics
  const getUserAnalytics = useCallback(
    (userId: string): UserInteractionAnalytics | null => {
      return analytics.get(userId) || null;
    },
    [analytics],
  );

  // Get interaction history
  const getUserInteractionHistory = useCallback(
    (userId: string): UserInteractionHistory[] => {
      return interactionHistory.get(userId) || [];
    },
    [interactionHistory],
  );

  // Clear cache
  const clearCache = useCallback((userId?: string) => {
    if (userId) {
      setUserProfiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      setCacheTimestamps((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        newMap.delete(`relationship_${userId}`);
        return newMap;
      });
    } else {
      setUserProfiles(new Map());
      setRelationshipStatus(new Map());
      setCacheTimestamps(new Map());
    }
  }, []);

  return {
    // Data
    userProfiles: Object.fromEntries(userProfiles),
    relationshipStatus: Object.fromEntries(relationshipStatus),
    loading: Object.fromEntries(loading),

    // Actions
    getUserProfile,
    getRelationshipStatus,
    followUser,
    unfollowUser,
    blockUser,
    reportUser,
    viewProfile,
    trackInteraction,

    // Modal management
    profileModalUserId,
    followListUserId,
    openProfileModal,
    closeProfileModal,
    openFollowListModal,
    closeFollowListModal,

    // Analytics
    getUserAnalytics,
    getUserInteractionHistory,

    // Utilities
    clearCache,
    isCacheValid,
  };
};
