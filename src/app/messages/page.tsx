'use client';

import React, { useState } from 'react';
import { MessagesSidebar, ChatArea } from '@/features/messages/components';

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();

  // Mock current user ID - this should come from auth context
  const currentUserId = '1';

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 hidden md:block">
        <MessagesSidebar
          currentUserId={currentUserId}
          onConversationSelect={handleConversationSelect}
          selectedConversationId={selectedConversationId}
          className="h-full"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatArea conversationId={selectedConversationId} className="h-full" />
      </div>

      {/* Mobile: Show only sidebar or chat based on selection */}
      <div className="md:hidden w-full">
        {selectedConversationId ? (
          <ChatArea
            conversationId={selectedConversationId}
            className="h-full"
          />
        ) : (
          <MessagesSidebar
            currentUserId={currentUserId}
            onConversationSelect={handleConversationSelect}
            selectedConversationId={selectedConversationId}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
