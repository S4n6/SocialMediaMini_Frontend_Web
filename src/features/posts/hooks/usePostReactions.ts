'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactionType,
  REACTION_TYPES,
} from '../components/interactions/PostReactions';

// Mock API delay for development
const API_DELAY = 500;

interface ReactionSummary {
  type: ReactionType;
  count: number;
}

interface ReactionData {
  id: string;
  type: ReactionType;
  userId: string;
  postId: string;
  createdAt: string;
}

interface UsePostReactionsReturn {
  reactions: ReactionSummary[];
  userReaction: ReactionType | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  addReaction: (reactionType: ReactionType) => Promise<void>;
  removeReaction: () => Promise<void>;
  toggleReaction: (reactionType: ReactionType) => Promise<void>;
}

interface UsePostReactionsProps {
  postId: string;
  initialReactions?: ReactionData[];
  currentUserId?: string;
}

// Mock API functions (to be replaced with real API calls)
const mockAddReaction = async (
  postId: string,
  reactionType: ReactionType,
  userId: string,
): Promise<ReactionData> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: reactionType,
    userId,
    postId,
    createdAt: new Date().toISOString(),
  };
};

const mockRemoveReaction = async (
  postId: string,
  userId: string,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));
};

const mockGetReactions = async (postId: string): Promise<ReactionData[]> => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY));
  // Return mock data for development
  return [
    {
      id: '1',
      type: REACTION_TYPES.LIKE,
      userId: 'user1',
      postId,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: REACTION_TYPES.LOVE,
      userId: 'user2',
      postId,
      createdAt: new Date().toISOString(),
    },
  ];
};

export const usePostReactions = ({
  postId,
  initialReactions = [],
  currentUserId = 'current-user', // Mock current user ID
}: UsePostReactionsProps): UsePostReactionsReturn => {
  const [reactions, setReactions] = useState<ReactionData[]>(initialReactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate reaction summaries
  const reactionSummaries = useMemo((): ReactionSummary[] => {
    const summaryMap = new Map<ReactionType, number>();

    reactions.forEach((reaction) => {
      const current = summaryMap.get(reaction.type) || 0;
      summaryMap.set(reaction.type, current + 1);
    });

    return Array.from(summaryMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  }, [reactions]);

  // Get current user's reaction
  const userReaction = useMemo((): ReactionType | null => {
    const userReactionData = reactions.find((r) => r.userId === currentUserId);
    return userReactionData?.type || null;
  }, [reactions, currentUserId]);

  // Calculate total reactions count
  const totalCount = useMemo(() => reactions.length, [reactions]);

  // Add reaction
  const addReaction = useCallback(
    async (reactionType: ReactionType): Promise<void> => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Optimistic update
        const optimisticReaction: ReactionData = {
          id: `temp-${Date.now()}`,
          type: reactionType,
          userId: currentUserId,
          postId,
          createdAt: new Date().toISOString(),
        };

        // Remove existing reaction if any, then add new one
        setReactions((prev) => {
          const withoutUserReaction = prev.filter(
            (r) => r.userId !== currentUserId,
          );
          return [...withoutUserReaction, optimisticReaction];
        });

        // Make API call
        const newReaction = await mockAddReaction(
          postId,
          reactionType,
          currentUserId,
        );

        // Update with real data
        setReactions((prev) =>
          prev.map((r) => (r.id === optimisticReaction.id ? newReaction : r)),
        );
      } catch (err) {
        setError('Failed to add reaction');
        // Revert optimistic update
        setReactions((prev) => prev.filter((r) => r.userId !== currentUserId));
        console.error('Error adding reaction:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, currentUserId, isLoading],
  );

  // Remove reaction
  const removeReaction = useCallback(async (): Promise<void> => {
    if (isLoading || !userReaction) return;

    setIsLoading(true);
    setError(null);

    const previousReactions = reactions;

    try {
      // Optimistic update
      setReactions((prev) => prev.filter((r) => r.userId !== currentUserId));

      // Make API call
      await mockRemoveReaction(postId, currentUserId);
    } catch (err) {
      setError('Failed to remove reaction');
      // Revert optimistic update
      setReactions(previousReactions);
      console.error('Error removing reaction:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, currentUserId, userReaction, reactions, isLoading]);

  // Toggle reaction (convenience method)
  const toggleReaction = useCallback(
    async (reactionType: ReactionType): Promise<void> => {
      if (userReaction === reactionType) {
        await removeReaction();
      } else {
        await addReaction(reactionType);
      }
    },
    [userReaction, addReaction, removeReaction],
  );

  return {
    reactions: reactionSummaries,
    userReaction,
    totalCount,
    isLoading,
    error,
    addReaction,
    removeReaction,
    toggleReaction,
  };
};

// Type exports
export type { ReactionSummary, ReactionData, UsePostReactionsReturn };
