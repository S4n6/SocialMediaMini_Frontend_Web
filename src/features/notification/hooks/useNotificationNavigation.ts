import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Notification } from '../types/notification';

export function useNotificationNavigation() {
  const router = useRouter();

  const navigateToNotification = useCallback(
    (notification: Notification) => {
      const username = notification.user.username;

      switch (notification.type) {
        case 'like':
        case 'comment':
        case 'mention':
          // Navigate to post
          if ('postId' in notification && notification.postId) {
            router.push(`/post/${notification.postId}`);
          } else {
            router.push(`/profile/${username}`);
          }
          break;

        case 'follow':
          // Navigate to user profile
          router.push(`/profile/${username}`);
          break;

        case 'story_like':
        case 'story_reply':
          // Navigate to story
          if ('storyId' in notification && notification.storyId) {
            router.push(`/stories/${notification.storyId}`);
          } else {
            router.push(`/profile/${username}`);
          }
          break;

        default:
          // Default: navigate to user profile
          router.push(`/profile/${username}`);
          break;
      }
    },
    [router],
  );

  const navigateToProfile = useCallback(
    (username: string) => {
      router.push(`/profile/${username}`);
    },
    [router],
  );

  const navigateToPost = useCallback(
    (postId: string) => {
      router.push(`/post/${postId}`);
    },
    [router],
  );

  const navigateToStory = useCallback(
    (storyId: string) => {
      router.push(`/stories/${storyId}`);
    },
    [router],
  );

  return {
    navigateToNotification,
    navigateToProfile,
    navigateToPost,
    navigateToStory,
  };
}
