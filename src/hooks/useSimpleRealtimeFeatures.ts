import { useState, useCallback } from "react";

// Simplified real-time features hooks - mock implementation

export const useProfileRealtimeUpdates = (profileId?: string) => {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLive] = useState(false);

  return {
    followerCount,
    viewCount,
    isLive,
  };
};

export const useFollowActions = () => {
  const followUser = useCallback((userId: string) => {
    console.log("Follow user (mock):", userId);
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    console.log("Unfollow user (mock):", userId);
  }, []);

  const follow = followUser; // Alias for compatibility
  const unfollow = unfollowUser; // Alias for compatibility

  return {
    followUser,
    unfollowUser,
    follow,
    unfollow,
    isFollowing: false,
    isPending: false,
  };
};

export const usePresence = (userId?: string) => {
  const [isOnline] = useState(false);
  const [lastSeen] = useState<Date | null>(null);

  return {
    isOnline,
    lastSeen,
    isUserOnline: isOnline, // Alias for compatibility
  };
};

export const usePostRealtimeUpdates = (postId?: string) => {
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState<number | null>(null);

  return {
    likesCount,
    commentsCount,
  };
};

export const useMessagingFeatures = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const sendMessage = useCallback((message: string, chatId: string) => {
    console.log("Send message (mock):", message, chatId);
  }, []);

  const setTyping = useCallback((isTyping: boolean, chatId: string) => {
    console.log("Set typing (mock):", isTyping, chatId);
  }, []);

  return {
    messages,
    typingUsers,
    sendMessage,
    setTyping,
  };
};

export const useNotificationsRealtime = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  return {
    notifications,
    unreadCount,
  };
};
