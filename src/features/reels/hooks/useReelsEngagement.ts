'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Hook for managing video engagement actions
 * Instagram 2025 style: like, save, share, follow
 */

interface UseReelsEngagementOptions {
  videoId: string;
  userId: string;
  initialState: {
    isLiked: boolean;
    isSaved: boolean;
    isFollowing: boolean;
    likesCount: number;
    savesCount?: number;
  };
  onLike?: (videoId: string, isLiked: boolean) => Promise<void>;
  onSave?: (videoId: string, isSaved: boolean) => Promise<void>;
  onFollow?: (userId: string, isFollowing: boolean) => Promise<void>;
  onShare?: (videoId: string, shareType: string) => Promise<void>;
}

export const useReelsEngagement = (options: UseReelsEngagementOptions) => {
  const { videoId, userId, initialState, onLike, onSave, onFollow, onShare } =
    options;

  // State management
  const [isLiked, setIsLiked] = useState(initialState.isLiked);
  const [isSaved, setIsSaved] = useState(initialState.isSaved);
  const [isFollowing, setIsFollowing] = useState(initialState.isFollowing);
  const [likesCount, setLikesCount] = useState(initialState.likesCount);
  const [savesCount, setSavesCount] = useState(initialState.savesCount || 0);

  // Loading states
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);

  // Animation refs for heart animation
  const likeAnimationRef = useRef<boolean>(false);

  // Like/Unlike functionality
  const toggleLike = useCallback(async () => {
    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);

      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

      // Trigger heart animation for like
      if (newIsLiked) {
        likeAnimationRef.current = true;
        setTimeout(() => {
          likeAnimationRef.current = false;
        }, 1000);
      }

      // API call
      await onLike?.(videoId, newIsLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  }, [isLiked, isLikeLoading, videoId, onLike]);

  // Save/Unsave functionality
  const toggleSave = useCallback(async () => {
    if (isSaveLoading) return;

    try {
      setIsSaveLoading(true);

      // Optimistic update
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);
      setSavesCount((prev) => (newIsSaved ? prev + 1 : prev - 1));

      // API call
      await onSave?.(videoId, newIsSaved);
    } catch (error) {
      // Revert on error
      setIsSaved(!isSaved);
      setSavesCount((prev) => (isSaved ? prev + 1 : prev - 1));
      console.error('Failed to toggle save:', error);
    } finally {
      setIsSaveLoading(false);
    }
  }, [isSaved, isSaveLoading, videoId, onSave]);

  // Follow/Unfollow functionality
  const toggleFollow = useCallback(async () => {
    if (isFollowLoading) return;

    try {
      setIsFollowLoading(true);

      // Optimistic update
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);

      // API call
      await onFollow?.(userId, newIsFollowing);
    } catch (error) {
      // Revert on error
      setIsFollowing(!isFollowing);
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  }, [isFollowing, isFollowLoading, userId, onFollow]);

  // Share functionality
  const shareVideo = useCallback(
    async (
      shareType:
        | 'link'
        | 'instagram'
        | 'whatsapp'
        | 'twitter'
        | 'facebook' = 'link',
    ) => {
      if (isShareLoading) return;

      try {
        setIsShareLoading(true);

        // Handle different share types
        switch (shareType) {
          case 'link':
            // Copy link to clipboard
            const videoUrl = `${window.location.origin}/reels/${videoId}`;
            await navigator.clipboard.writeText(videoUrl);
            break;

          case 'instagram':
            // Instagram sharing (mobile only)
            if (navigator.share) {
              await navigator.share({
                title: 'Check out this Reel!',
                url: `${window.location.origin}/reels/${videoId}`,
              });
            }
            break;

          case 'whatsapp':
            const whatsappUrl = `https://wa.me/?text=Check out this amazing reel! ${window.location.origin}/reels/${videoId}`;
            window.open(whatsappUrl, '_blank');
            break;

          case 'twitter':
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/reels/' + videoId)}&text=Check out this amazing reel!`;
            window.open(twitterUrl, '_blank');
            break;

          case 'facebook':
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/reels/' + videoId)}`;
            window.open(facebookUrl, '_blank');
            break;
        }

        // API call to track share
        await onShare?.(videoId, shareType);
      } catch (error) {
        console.error('Failed to share:', error);
      } finally {
        setIsShareLoading(false);
      }
    },
    [isShareLoading, videoId, onShare],
  );

  // Double tap to like (Instagram style)
  const handleDoubleTapLike = useCallback(() => {
    if (!isLiked) {
      toggleLike();
    }
  }, [isLiked, toggleLike]);

  // Format count display
  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  return {
    // State
    isLiked,
    isSaved,
    isFollowing,
    likesCount,
    savesCount,

    // Loading states
    isLikeLoading,
    isSaveLoading,
    isFollowLoading,
    isShareLoading,

    // Actions
    toggleLike,
    toggleSave,
    toggleFollow,
    shareVideo,
    handleDoubleTapLike,

    // Utilities
    formatCount,
    showLikeAnimation: likeAnimationRef.current,
  };
};
