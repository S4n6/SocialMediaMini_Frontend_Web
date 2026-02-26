'use client';

import React from 'react';
import { ConversationItem } from './ConversationItem';
import { Conversation } from '../types';
import { useConversations } from '../hooks/useMessagingApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ConversationListProps {
  currentUserId: string;
  searchQuery: string;
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
  useApi?: boolean; // Toggle between API and mock data
}

// Mock data for development
const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [
      {
        id: '2',
        username: 'john_doe',
        fullName: 'John Doe',
        avatar: '/images/avatar1.jpg',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg1',
      content: 'Hey! How are you doing?',
      senderId: '2',
      receiverId: '1',
      conversationId: '1',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      messageType: 'text',
    },
    createdAt: new Date(Date.now() - 86400 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 2,
    isGroup: false,
  },
  {
    id: '2',
    participants: [
      {
        id: '3',
        username: 'jane_smith',
        fullName: 'Jane Smith',
        avatar: '/images/avatar2.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ],
    lastMessage: {
      id: 'msg2',
      content: 'Thanks for the help!',
      senderId: '1', // Current user sent this
      receiverId: '3',
      conversationId: '2',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      messageType: 'text',
    },
    createdAt: new Date(Date.now() - 3 * 86400 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: '3',
    participants: [
      {
        id: '4',
        username: 'team_lead',
        fullName: 'Team Lead',
        avatar: '/images/avatar3.jpg',
        isOnline: true,
      },
      {
        id: '5',
        username: 'dev_member',
        fullName: 'Dev Member',
        avatar: '/images/avatar4.jpg',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg3',
      content: 'Meeting at 3 PM today',
      senderId: '4',
      receiverId: '1',
      conversationId: '3',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      messageType: 'text',
    },
    createdAt: new Date(Date.now() - 7 * 86400 * 1000), // 1 week ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unreadCount: 0,
    isGroup: true,
    groupName: 'Development Team',
  },
];

export function ConversationList({
  currentUserId,
  searchQuery,
  onConversationSelect,
  selectedConversationId,
  useApi = false,
}: ConversationListProps) {
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
  } = useConversations({ limit: 20 });

  // Convert API conversations to UI format when using API
  const apiConversations: Conversation[] = React.useMemo(() => {
    if (!useApi || !apiData?.pages) return [];

    return apiData.pages.flatMap((page) =>
      page.conversations.map((apiConv) => ({
        id: apiConv.id,
        participants:
          apiConv.participants?.map((p) => ({
            id: p.userId,
            username: p.user?.username || '',
            fullName: p.user?.fullName || '',
            avatar: p.user?.avatar,
            isOnline: p.user?.isOnline || false,
            lastSeen: p.user?.lastSeen ? new Date(p.user.lastSeen) : undefined,
          })) || [],
        lastMessage: apiConv.lastMessage
          ? {
              id: 'last-msg',
              content: apiConv.lastMessage.content,
              senderId: apiConv.lastMessage.senderId,
              receiverId: currentUserId,
              conversationId: apiConv.id,
              createdAt: new Date(apiConv.lastMessage.sentAt),
              updatedAt: new Date(apiConv.lastMessage.sentAt),
              isRead: true, // Will be determined by API
              messageType: 'text',
            }
          : undefined,
        createdAt: new Date(apiConv.lastActivity),
        updatedAt: new Date(apiConv.lastActivity),
        unreadCount: apiConv.unreadCount,
        isGroup: apiConv.type === 'group',
        groupName: apiConv.title,
      })),
    );
  }, [apiData, useApi, currentUserId]);

  // Use API data or mock data based on useApi flag
  const conversations = useApi ? apiConversations : mockConversations;
  const isLoading = useApi ? apiLoading : false;

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation: Conversation) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();

      // Search in participant names
      const participantMatch = conversation.participants.some(
        (participant: any) =>
          participant.fullName.toLowerCase().includes(searchLower) ||
          participant.username.toLowerCase().includes(searchLower),
      );

      // Search in group name
      const groupNameMatch = conversation.groupName
        ?.toLowerCase()
        .includes(searchLower);

      // Search in last message
      const messageMatch = conversation.lastMessage?.content
        .toLowerCase()
        .includes(searchLower);

      return participantMatch || groupNameMatch || messageMatch;
    },
  );

  // API Error state
  if (useApi && isError) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-4">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Failed to load conversations
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
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <p className="text-sm">
          {searchQuery ? 'No conversations found' : 'No messages yet'}
        </p>
        {!searchQuery && (
          <p className="text-xs mt-1">Start a conversation with someone!</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-0">
        {filteredConversations.map((conversation: Conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={currentUserId}
            isSelected={selectedConversationId === conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
          />
        ))}
      </div>

      {/* Load More Button for API */}
      {useApi && hasNextPage && (
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full"
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
