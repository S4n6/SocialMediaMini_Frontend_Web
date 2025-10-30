'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { MessageItem } from './MessageItem';
import { Message } from '../types';
import { useMessages } from '../hooks/useMessagingApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface MessageListProps {
  conversationId: string;
  currentUserId: string;
  useApi?: boolean; // Toggle between API and mock data
  className?: string;
}

// Mock messages for development
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey! How are you doing?',
    senderId: '2',
    receiverId: '1',
    conversationId: '1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '2',
    content: "I'm doing great! Thanks for asking 😊",
    senderId: '1', // Current user
    receiverId: '2',
    conversationId: '1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 30 seconds later
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '3',
    content: 'What have you been up to lately?',
    senderId: '2',
    receiverId: '1',
    conversationId: '1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000), // 1 minute later
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '4',
    content:
      "I've been working on a new project. It's a social media app similar to Instagram!",
    senderId: '1', // Current user
    receiverId: '2',
    conversationId: '1',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '5',
    content: "That sounds awesome! I'd love to see it when it's ready 🚀",
    senderId: '2',
    receiverId: '1',
    conversationId: '1',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 30000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 30000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '6',
    content: "Sure! I'll share some screenshots with you soon",
    senderId: '1', // Current user
    receiverId: '2',
    conversationId: '1',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
    messageType: 'text',
  },
  {
    id: '7',
    content: 'Looking forward to it! 👍',
    senderId: '2',
    receiverId: '1',
    conversationId: '1',
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    updatedAt: new Date(Date.now() - 25 * 60 * 1000),
    isRead: false, // Unread message
    messageType: 'text',
  },
];

export function MessageList({
  conversationId,
  currentUserId,
  useApi = false,
  className = '',
}: MessageListProps) {
  // Use API data if enabled
  const {
    data: apiData,
    error,
    isLoading: apiLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMessages(conversationId, { limit: 30 });

  // Convert API messages to UI format when using API
  const apiMessages: Message[] = React.useMemo(() => {
    if (!useApi || !apiData?.pages) return [];

    return apiData.pages.flatMap((page) =>
      page.messages.map((apiMsg) => ({
        id: apiMsg.id,
        content: apiMsg.content,
        senderId: apiMsg.senderId || '',
        receiverId: currentUserId,
        conversationId: apiMsg.conversationId,
        createdAt: new Date(apiMsg.sentAt),
        updatedAt: new Date(apiMsg.editedAt || apiMsg.sentAt),
        isRead: apiMsg.status === 'read',
        messageType: apiMsg.type as any,
        attachmentUrl: apiMsg.attachmentUrl,
        replyToMessageId: apiMsg.replyToMessageId,
        reactions: apiMsg.reactions.map((r) => ({
          emoji: r.emoji,
          users: r.userIds.map((userId) => ({
            id: userId,
            username: '',
            fullName: '',
          })),
          count: r.count,
        })),
      })),
    );
  }, [apiData, useApi, currentUserId]);

  // Use API data or mock data based on useApi flag
  const messages = useApi ? apiMessages : mockMessages;
  const isLoading = useApi ? apiLoading : false;
  const hasMore = useApi ? hasNextPage : false;
  const onLoadMore = useApi ? () => fetchNextPage() : undefined;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isLoading || !onLoadMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop === 0) {
      onLoadMore();
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  // Format date for display
  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Format as "Monday, January 1"
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const messageGroups = groupMessagesByDate(messages);
  const sortedDates = Object.keys(messageGroups).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  // API Error state
  if (useApi && isError) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full ${className}`}
      >
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground">
              Failed to load messages
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
    >
      {/* Loading indicator for loading more messages */}
      {isFetchingNextPage && hasMore && (
        <div className="flex justify-center py-2">
          <Button variant="ghost" disabled className="gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading more...
          </Button>
        </div>
      )}

      {/* Load more button */}
      {!isFetchingNextPage && hasMore && (
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            className="gap-2"
          >
            Load older messages
          </Button>
        </div>
      )}

      {/* Messages grouped by date */}
      {sortedDates.map((dateString) => (
        <div key={dateString} className="space-y-2">
          {/* Date separator */}
          <div className="flex justify-center">
            <div className="bg-secondary/80 rounded-full px-3 py-1">
              <p className="text-xs text-muted-foreground font-medium">
                {formatDateGroup(dateString)}
              </p>
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {messageGroups[dateString].map((message, index, arr) => {
              const prevMessage = index > 0 ? arr[index - 1] : null;
              const nextMessage =
                index < arr.length - 1 ? arr[index + 1] : null;

              // Check if this message should be grouped with previous
              const isGroupedWithPrevious =
                prevMessage &&
                prevMessage.senderId === message.senderId &&
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() <
                  5 * 60 * 1000; // 5 minutes

              // Check if this message should be grouped with next
              const isGroupedWithNext =
                nextMessage &&
                nextMessage.senderId === message.senderId &&
                new Date(nextMessage.createdAt).getTime() -
                  new Date(message.createdAt).getTime() <
                  5 * 60 * 1000; // 5 minutes

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isFromCurrentUser={message.senderId === currentUserId}
                  isGroupedWithPrevious={!!isGroupedWithPrevious}
                  isGroupedWithNext={!!isGroupedWithNext}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Loading skeleton for initial load */}
      {isLoading && messages.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-xs">
                {i % 3 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <div className="space-y-1">
                  <Skeleton
                    className={`h-10 ${i % 4 === 0 ? 'w-32' : i % 4 === 1 ? 'w-48' : i % 4 === 2 ? 'w-24' : 'w-40'} rounded-2xl`}
                  />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
