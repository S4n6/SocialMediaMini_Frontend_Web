'use client';

import React, { useState } from 'react';
import { Search, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationList } from './ConversationList';

interface MessagesSidebarProps {
  currentUserId: string;
  onConversationSelect: (conversationId: string) => void;
  selectedConversationId?: string;
  useApi?: boolean;
  className?: string;
}

export default function MessagesSidebar({
  currentUserId,
  onConversationSelect,
  selectedConversationId,
  useApi = false,
  className = '',
}: MessagesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          currentUserId={currentUserId}
          searchQuery={searchQuery}
          onConversationSelect={onConversationSelect}
          selectedConversationId={selectedConversationId}
          useApi={useApi}
        />
      </div>
    </div>
  );
}
