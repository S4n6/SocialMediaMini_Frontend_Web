'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  History,
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';
import { MessageSearch } from './MessageSearch';
import { MessageHistoryView } from './MessageHistory';
import { ConversationSummary, SearchStats } from '../types/search';

interface MessageSearchAndHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (messageId: string, conversationId: string) => void;
  conversations: { id: string; name: string; type: 'direct' | 'group' }[];
  currentUserId: string;
}

export function MessageSearchAndHistory({
  isOpen,
  onClose,
  onSelectMessage,
  conversations,
  currentUserId,
}: MessageSearchAndHistoryProps) {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showSearch, setShowSearch] = useState(false);

  // Mock statistics data
  const mockStats: SearchStats = {
    totalMessages: 12547,
    totalConversations: 45,
    messagesByType: {
      text: 9847,
      image: 1562,
      video: 423,
      audio: 287,
      file: 428,
    },
    messagesByDate: {
      '2024-01': 1245,
      '2024-02': 1387,
      '2024-03': 1562,
      '2024-04': 1423,
      '2024-05': 1356,
      '2024-06': 1478,
    },
    topSenders: [
      { userId: 'user1', name: 'John Doe', messageCount: 2847 },
      { userId: 'user2', name: 'Jane Smith', messageCount: 2156 },
      { userId: 'user3', name: 'Alice Cooper', messageCount: 1923 },
      { userId: 'user4', name: 'Bob Wilson', messageCount: 1645 },
      { userId: 'user5', name: 'Charlie Brown', messageCount: 1234 },
    ],
  };

  // Mock conversation summaries
  const mockConversationSummaries: ConversationSummary[] = [
    {
      conversationId: 'conv1',
      name: 'Development Team',
      type: 'group',
      avatar: '',
      lastMessage: {
        content: 'Great work on the latest feature!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        senderName: 'John Doe',
      },
      messageCount: 3247,
      participantCount: 12,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      conversationId: 'conv2',
      name: 'Design Review',
      type: 'group',
      avatar: '',
      lastMessage: {
        content: 'The mockups look fantastic',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        senderName: 'Alice Designer',
      },
      messageCount: 1856,
      participantCount: 8,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      conversationId: 'conv3',
      name: 'Jane Smith',
      type: 'direct',
      avatar: '',
      lastMessage: {
        content: 'Thanks for the update!',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        senderName: 'Jane Smith',
      },
      messageCount: 567,
      participantCount: 2,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const handleOpenSearch = () => {
    setShowSearch(true);
  };

  const handleOpenHistory = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setActiveTab('history');
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-500';
      case 'image':
        return 'bg-green-500';
      case 'video':
        return 'bg-purple-500';
      case 'audio':
        return 'bg-orange-500';
      case 'file':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleOpenSearch}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Search Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Find messages across all conversations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Message Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  View your messaging activity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {mockStats.totalMessages.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Messages</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {mockStats.totalConversations}
              </p>
              <p className="text-sm text-muted-foreground">Conversations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.max(...Object.values(mockStats.messagesByDate))}
              </p>
              <p className="text-sm text-muted-foreground">Peak Month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round(
                  mockStats.totalMessages / mockStats.totalConversations,
                )}
              </p>
              <p className="text-sm text-muted-foreground">Avg per Chat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(mockStats.messagesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getMessageTypeColor(type)}`}
                  />
                  <span className="capitalize">{type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {((count / mockStats.totalMessages) * 100).toFixed(1)}%
                  </span>
                  <span className="font-medium">{count.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Senders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most Active Senders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStats.topSenders.map((sender, index) => (
              <div
                key={sender.userId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span>{sender.name}</span>
                </div>
                <span className="font-medium">
                  {sender.messageCount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConversationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Conversation History</h3>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {mockConversationSummaries.map((conv) => (
          <Card
            key={conv.conversationId}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleOpenHistory(conv.conversationId)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{conv.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        conv.type === 'group'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {conv.type}
                    </span>
                  </div>

                  {conv.lastMessage && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">
                        {conv.lastMessage.senderName}:
                      </span>{' '}
                      {conv.lastMessage.content}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{conv.messageCount.toLocaleString()} messages</span>
                    <span>{conv.participantCount} participants</span>
                    <span>
                      Created {new Date(conv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <History className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHistoryTab = () => {
    if (!selectedConversation) {
      return (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Select a conversation to view its history
          </p>
        </div>
      );
    }

    const conversation = conversations.find(
      (c) => c.id === selectedConversation,
    );
    return (
      <MessageHistoryView
        conversationId={selectedConversation}
        conversationName={conversation?.name || 'Unknown Conversation'}
        currentUserId={currentUserId}
        onSelectMessage={(messageId) =>
          onSelectMessage(messageId, selectedConversation)
        }
        onJumpToMessage={(messageId) =>
          onSelectMessage(messageId, selectedConversation)
        }
      />
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Message Search & History</DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="overview" className="mt-0">
                {renderOverviewTab()}
              </TabsContent>

              <TabsContent value="conversations" className="mt-0">
                {renderConversationsTab()}
              </TabsContent>

              <TabsContent value="history" className="mt-0 h-full">
                {renderHistoryTab()}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <MessageSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectMessage={onSelectMessage}
        conversations={conversations}
        currentUserId={currentUserId}
      />
    </>
  );
}
