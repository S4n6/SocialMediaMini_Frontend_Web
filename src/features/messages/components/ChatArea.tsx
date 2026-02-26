'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatHeader from './ChatHeader';
import { MessageList } from './MessageList';
import MessageInput from './MessageInput';
import { useMessageReply } from './MessageReply';
import { TypingIndicator } from './TypingIndicator';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageNotifications } from '../hooks/useNotifications';
import { User, Conversation, Message } from '../types';

interface ChatAreaProps {
  conversationId?: string;
  currentUserId?: string;
  useApi?: boolean;
  useWebSocket?: boolean;
  className?: string;
}

// Mock conversation data - in real app this would come from props or API
const mockConversations: { [key: string]: Conversation } = {
  '1': {
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
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      messageType: 'text',
    },
    createdAt: new Date(Date.now() - 86400 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 2,
    isGroup: false,
  },
  '2': {
    id: '2',
    participants: [
      {
        id: '3',
        username: 'jane_smith',
        fullName: 'Jane Smith',
        avatar: '/images/avatar2.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    lastMessage: {
      id: 'msg2',
      content: 'Thanks for the help!',
      senderId: '1',
      receiverId: '3',
      conversationId: '2',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      messageType: 'text',
    },
    createdAt: new Date(Date.now() - 3 * 86400 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
    isGroup: false,
  },
};

export default function ChatArea({
  conversationId,
  currentUserId = '1',
  useApi = false,
  useWebSocket: enableWebSocket = false,
  className = '',
}: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);

  // Reply functionality
  const { replyTo, startReply, cancelReply } = useMessageReply();

  // WebSocket integration
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    currentConversationId,
    typingUsers,
  } = useWebSocket({
    autoConnect: enableWebSocket,
    userId: currentUserId,
  });

  // Notification handling
  const { requestPermission, showNotificationForMessage } =
    useMessageNotifications(conversationId);

  // Get conversation data
  const conversation = conversationId
    ? mockConversations[conversationId]
    : null;
  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== currentUserId,
  );

  // Join/leave conversation when conversationId changes
  useEffect(() => {
    if (enableWebSocket && isConnected && conversationId) {
      joinConversation(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [
    conversationId,
    enableWebSocket,
    isConnected,
    joinConversation,
    leaveConversation,
  ]);

  // If no conversation is selected, show empty state
  if (!conversationId) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-full bg-background ${className}`}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <MessageSquare className="h-16 w-16 text-muted-foreground/40 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
          <p className="text-muted-foreground mb-6">
            Send private photos and messages to a friend or group.
          </p>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Send message
          </button>
        </div>
      </div>
    );
  }

  // Handle send message
  const handleSendMessage = (
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text',
    replyToId?: string,
    mediaFiles?: File[],
  ) => {
    console.log('Sending message:', {
      content,
      type,
      conversationId,
      replyToId,
      mediaFiles: mediaFiles?.map((f) => f.name),
    });

    // Clear reply state after sending
    if (replyTo) {
      cancelReply();
    }

    // In real app, this would call an API
  };

  // Handle reply to message
  const handleReply = (message: Message, sender?: User) => {
    startReply(message, sender);
  };

  // Handle typing
  const handleTyping = (isTyping: boolean) => {
    console.log('Typing status:', isTyping);
    // In real app, this would send typing status via websocket
  };

  // Handle back (mobile)
  const handleBack = () => {
    // In real app, this would navigate back to conversation list on mobile
    console.log('Back to conversation list');
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Chat Header */}
      <ChatHeader
        participant={otherParticipant}
        isGroup={conversation?.isGroup}
        groupName={conversation?.groupName}
        groupAvatar={conversation?.groupAvatar}
        participantCount={conversation?.participants.length}
        onBack={handleBack}
        onCall={() => console.log('Call')}
        onVideoCall={() => console.log('Video call')}
        onInfo={() => console.log('Info')}
      />

      {/* Messages List */}
      <MessageList
        conversationId={conversationId || ''}
        currentUserId={currentUserId}
        useApi={useApi}
        className="flex-1"
      />

      {/* Typing Indicator */}
      {enableWebSocket && conversationId && (
        <TypingIndicator
          users={Array.from(typingUsers.get(conversationId) || [])}
        />
      )}

      {/* Message Input */}
      <MessageInput
        conversationId={conversationId || ''}
        onTyping={handleTyping}
        placeholder="Message..."
        replyTo={replyTo}
        onCancelReply={cancelReply}
        useApi={useApi}
        useWebSocket={enableWebSocket}
      />
    </div>
  );
}
