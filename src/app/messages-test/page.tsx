'use client';

import React, { useState } from 'react';
import { MessagesSidebar, ChatArea } from '@/features/messages';
import { useWebSocket } from '@/features/messages/hooks/useWebSocket';
import { NotificationPermissionBanner } from '@/features/messages/components/NotificationPermission';
import {
  ConnectionStatusMonitor,
  WebSocketEventLogger,
} from '@/features/messages/components/ConnectionMonitor';
import { MultiTabSimulator } from '@/features/messages/components/MultiTabSimulator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function MessagesApiTestPage() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>('1');
  const [useApi, setUseApi] = useState(false); // Toggle between API and mock data
  const [enableWebSocket, setEnableWebSocket] = useState(false); // Toggle WebSocket
  const [currentUserId] = useState('1'); // Mock current user

  // WebSocket status monitoring
  const {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    isConnecting,
    typingUsers,
    onlineUsers,
  } = useWebSocket({
    autoConnect: false,
    userId: currentUserId,
    onConnectionChange: (status: string) => {
      console.log('WebSocket status changed:', status);
    },
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Test Controls Header */}
      <div className="border-b bg-muted/30 p-4 space-y-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">
              Messages API Integration Test
            </h1>
            <p className="text-sm text-muted-foreground">
              Test the messaging system with API integration vs mock data
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="api-mode"
                checked={useApi}
                onCheckedChange={setUseApi}
              />
              <Label htmlFor="api-mode" className="text-sm">
                Use API
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="websocket-mode"
                checked={enableWebSocket}
                onCheckedChange={async (checked) => {
                  setEnableWebSocket(checked);
                  if (checked) {
                    await connect();
                  } else {
                    disconnect();
                  }
                }}
              />
              <Label htmlFor="websocket-mode" className="text-sm">
                WebSocket
              </Label>
            </div>

            <Badge variant={useApi ? 'default' : 'secondary'}>
              {useApi ? 'API Mode' : 'Mock Mode'}
            </Badge>

            <Badge
              variant={
                isConnected
                  ? 'default'
                  : connectionStatus === 'connecting'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {isConnecting
                ? 'Connecting...'
                : isConnected
                  ? 'WS Connected'
                  : 'WS Disconnected'}
            </Badge>

            {enableWebSocket && (
              <div className="text-xs text-muted-foreground">
                Online: {onlineUsers.size} | Typing:{' '}
                {Array.from(typingUsers.values()).reduce(
                  (sum, set) => sum + set.size,
                  0,
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r">
          <MessagesSidebar
            currentUserId={currentUserId}
            onConversationSelect={setSelectedConversationId}
            selectedConversationId={selectedConversationId}
            useApi={useApi}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          {selectedConversationId ? (
            <ChatArea
              conversationId={selectedConversationId}
              currentUserId={currentUserId}
              useApi={useApi}
              useWebSocket={enableWebSocket}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="w-96">
                <CardHeader className="text-center">
                  <CardTitle>Select a Conversation</CardTitle>
                  <CardDescription>
                    Choose a conversation from the sidebar to start messaging
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Current Mode:{' '}
                      <Badge variant={useApi ? 'default' : 'secondary'}>
                        {useApi ? 'API Integration' : 'Mock Data'}
                      </Badge>
                      {' | '}
                      <Badge variant={isConnected ? 'default' : 'destructive'}>
                        {isConnected
                          ? 'WebSocket Active'
                          : 'WebSocket Inactive'}
                      </Badge>
                    </p>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>
                        <strong>Mock Mode:</strong> Uses static demo data
                      </p>
                      <p>
                        <strong>API Mode:</strong> Connects to backend messaging
                        API
                      </p>
                    </div>
                  </div>

                  {useApi && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>API Features:</strong>
                        <br />
                        • Real-time message loading
                        <br />
                        • File upload with progress
                        <br />
                        • Message reactions & replies
                        <br />
                        • Optimistic UI updates
                        <br />• Error handling & retry
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Notification Permission Banner */}
        <div className="max-w-6xl mx-auto">
          <NotificationPermissionBanner
            conversationId={selectedConversationId}
            onDismiss={() => console.log('Notification banner dismissed')}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-6xl mx-auto bg-background gap-4 p-4">
        {/* Left Column - Messages Interface */}
        <div className="flex-1 flex bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
          {/* Messages Sidebar */}
          <div className="w-80 border-r">
            <MessagesSidebar
              selectedConversationId={selectedConversationId}
              onConversationSelect={setSelectedConversationId}
              useApi={useApi}
              currentUserId={currentUserId}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            <ChatArea
              conversationId={selectedConversationId}
              currentUserId={currentUserId}
              useApi={useApi}
              useWebSocket={enableWebSocket}
            />
          </div>
        </div>

        {/* Right Column - Monitoring Tools */}
        <div className="w-96 space-y-4">
          <ConnectionStatusMonitor />
          <MultiTabSimulator />
          <WebSocketEventLogger />
        </div>
      </div>
    </div>
  );
}
