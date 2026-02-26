import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  WebSocketService,
  WebSocketConfig,
  WebSocketCallbacks,
  createWebSocketService,
  getWebSocketService,
} from '../services/websocket.service';
import { ApiMessage } from '../types/api.types';
import { messagingKeys } from './useMessagingApi';
import { toast } from 'sonner';

export interface UseWebSocketOptions {
  url?: string;
  token?: string;
  userId?: string;
  autoConnect?: boolean;
  onConnectionChange?: (
    status: 'connecting' | 'connected' | 'disconnected' | 'error',
  ) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const serviceRef = useRef<WebSocketService | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(
    new Map(),
  );
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Default WebSocket URL (adjust based on your backend)
  const defaultUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

  // Initialize WebSocket service
  const initializeService = useCallback(async () => {
    if (serviceRef.current?.isConnected()) {
      return serviceRef.current;
    }

    const config: WebSocketConfig = {
      url: options.url || defaultUrl,
      token: options.token,
      autoConnect: options.autoConnect !== false,
    };

    const callbacks: WebSocketCallbacks = {
      // Connection callbacks
      onConnect: () => {
        setConnectionStatus('connected');
        setIsConnecting(false);
        options.onConnectionChange?.('connected');
        toast.success('Connected to real-time messaging');
      },

      onDisconnect: (reason) => {
        setConnectionStatus('disconnected');
        setIsConnecting(false);
        options.onConnectionChange?.('disconnected');

        if (reason !== 'io client disconnect') {
          toast.error('Disconnected from real-time messaging');
        }
      },

      onError: (error) => {
        setConnectionStatus('error');
        setIsConnecting(false);
        options.onConnectionChange?.('error');
        console.error('WebSocket error:', error);
        toast.error('Real-time connection error');
      },

      onReconnect: (attemptNumber) => {
        setConnectionStatus('connected');
        options.onConnectionChange?.('connected');
        toast.success(`Reconnected after ${attemptNumber} attempts`);
      },

      // Message callbacks
      onMessageReceived: (message: ApiMessage) => {
        // Update React Query cache optimistically
        queryClient.setQueryData(
          messagingKeys.messagesList(message.conversationId),
          (old: any) => {
            if (!old) return old;

            // Add new message to the first page
            return {
              ...old,
              pages: old.pages.map((page: any, index: number) =>
                index === 0
                  ? { ...page, messages: [message, ...page.messages] }
                  : page,
              ),
            };
          },
        );

        // Update conversations list with new last message
        queryClient.invalidateQueries({
          queryKey: messagingKeys.conversations(),
        });

        // Show notification if not in current conversation
        if (currentConversationId !== message.conversationId) {
          // Show browser notification (if permission granted)
          if (Notification.permission === 'granted') {
            new Notification('New message', {
              body: message.content,
              icon: '/icons/message-icon.png',
            });
          }
        }
      },

      onMessageDelivered: (messageId, conversationId) => {
        // Update message status in cache
        queryClient.setQueryData(
          messagingKeys.messagesList(conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: ApiMessage) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        status: 'delivered',
                        deliveredAt: new Date().toISOString(),
                      }
                    : msg,
                ),
              })),
            };
          },
        );
      },

      onMessageRead: (messageId, conversationId, userId) => {
        // Update message status in cache
        queryClient.setQueryData(
          messagingKeys.messagesList(conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: ApiMessage) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        status: 'read',
                        readAt: new Date().toISOString(),
                      }
                    : msg,
                ),
              })),
            };
          },
        );
      },

      onMessageEdited: (message: ApiMessage) => {
        // Update edited message in cache
        queryClient.setQueryData(
          messagingKeys.messagesList(message.conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: ApiMessage) =>
                  msg.id === message.id ? message : msg,
                ),
              })),
            };
          },
        );
      },

      onMessageDeleted: (messageId, conversationId) => {
        // Remove deleted message from cache
        queryClient.setQueryData(
          messagingKeys.messagesList(conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.filter(
                  (msg: ApiMessage) => msg.id !== messageId,
                ),
              })),
            };
          },
        );
      },

      // Typing callbacks
      onTypingStart: (event) => {
        if (event.userId === options.userId) return; // Ignore own typing

        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const conversationTypers =
            newMap.get(event.conversationId) || new Set();
          conversationTypers.add(event.userId);
          newMap.set(event.conversationId, conversationTypers);
          return newMap;
        });
      },

      onTypingStop: (event) => {
        if (event.userId === options.userId) return; // Ignore own typing

        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const conversationTypers =
            newMap.get(event.conversationId) || new Set();
          conversationTypers.delete(event.userId);

          if (conversationTypers.size === 0) {
            newMap.delete(event.conversationId);
          } else {
            newMap.set(event.conversationId, conversationTypers);
          }
          return newMap;
        });
      },

      // Online status callbacks
      onUserOnline: (event) => {
        setOnlineUsers((prev) => new Set([...prev, event.userId]));
      },

      onUserOffline: (event) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.userId);
          return newSet;
        });
      },

      // Reaction callbacks
      onReactionAdded: (event) => {
        // Update reactions in message cache
        queryClient.setQueryData(
          messagingKeys.messagesList(event.conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: ApiMessage) => {
                  if (msg.id === event.messageId) {
                    const existingReaction = msg.reactions.find(
                      (r) => r.emoji === event.emoji,
                    );
                    if (existingReaction) {
                      return {
                        ...msg,
                        reactions: msg.reactions.map((r) =>
                          r.emoji === event.emoji
                            ? {
                                ...r,
                                userIds: [...r.userIds, event.userId],
                                count: r.count + 1,
                              }
                            : r,
                        ),
                      };
                    } else {
                      return {
                        ...msg,
                        reactions: [
                          ...msg.reactions,
                          {
                            emoji: event.emoji,
                            userIds: [event.userId],
                            count: 1,
                          },
                        ],
                      };
                    }
                  }
                  return msg;
                }),
              })),
            };
          },
        );
      },

      onReactionRemoved: (event) => {
        // Update reactions in message cache
        queryClient.setQueryData(
          messagingKeys.messagesList(event.conversationId),
          (old: any) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: ApiMessage) => {
                  if (msg.id === event.messageId) {
                    return {
                      ...msg,
                      reactions: msg.reactions
                        .map((r) =>
                          r.emoji === event.emoji
                            ? {
                                ...r,
                                userIds: r.userIds.filter(
                                  (id) => id !== event.userId,
                                ),
                                count: r.count - 1,
                              }
                            : r,
                        )
                        .filter((r) => r.count > 0),
                    };
                  }
                  return msg;
                }),
              })),
            };
          },
        );
      },

      // Conversation callbacks
      onConversationUpdated: (conversationId) => {
        queryClient.invalidateQueries({
          queryKey: messagingKeys.conversation(conversationId),
        });
        queryClient.invalidateQueries({
          queryKey: messagingKeys.conversations(),
        });
      },

      onNewConversation: (conversationId) => {
        queryClient.invalidateQueries({
          queryKey: messagingKeys.conversations(),
        });
        toast.success('New conversation started');
      },
    };

    const service = createWebSocketService(config);
    service.setCallbacks(callbacks);
    serviceRef.current = service;

    return service;
  }, [
    options.url,
    options.token,
    options.userId,
    options.autoConnect,
    currentConversationId,
    queryClient,
  ]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (isConnecting || serviceRef.current?.isConnected()) {
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      options.onConnectionChange?.('connecting');

      const service = await initializeService();
      await service.connect(options.userId);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('error');
      setIsConnecting(false);
      options.onConnectionChange?.('error');
    }
  }, [
    initializeService,
    isConnecting,
    options.userId,
    options.onConnectionChange,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      setConnectionStatus('disconnected');
      options.onConnectionChange?.('disconnected');
    }
  }, [options.onConnectionChange]);

  // Join conversation
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (serviceRef.current?.isConnected()) {
        // Leave previous conversation if any
        if (currentConversationId && currentConversationId !== conversationId) {
          serviceRef.current.leaveConversation(currentConversationId);
        }

        serviceRef.current.joinConversation(conversationId);
        setCurrentConversationId(conversationId);
      }
    },
    [currentConversationId],
  );

  // Leave conversation
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (serviceRef.current?.isConnected()) {
        serviceRef.current.leaveConversation(conversationId);
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
        }
      }
    },
    [currentConversationId],
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (serviceRef.current?.isConnected()) {
        serviceRef.current.sendTypingIndicator(conversationId, isTyping);
      }
    },
    [],
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string, conversationId: string) => {
      if (serviceRef.current?.isConnected()) {
        serviceRef.current.markMessageAsRead(messageId, conversationId);
      }
    },
    [],
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, [connect, options.autoConnect]);

  // Update online status when window visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (serviceRef.current?.isConnected()) {
        serviceRef.current.updateOnlineStatus(!document.hidden);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    // Connection state
    isConnected: connectionStatus === 'connected',
    isConnecting,
    connectionStatus,

    // Connection methods
    connect,
    disconnect,

    // Conversation methods
    joinConversation,
    leaveConversation,
    currentConversationId,

    // Real-time features
    sendTyping,
    markAsRead,
    typingUsers,
    onlineUsers,

    // Utility
    service: serviceRef.current,
  };
}
