'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  X,
  Send,
  Users,
  MessageSquare,
  Clock,
  Eye,
  EyeOff,
  Monitor,
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageNotifications } from '../hooks/useNotifications';

interface TabInstance {
  id: string;
  name: string;
  userId: string;
  conversationId: string;
  isActive: boolean;
  isVisible: boolean;
  messageCount: number;
  lastActivity: Date;
}

interface SimulatedMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  timestamp: Date;
  tabId: string;
}

export function MultiTabSimulator({ className = '' }: { className?: string }) {
  const [tabs, setTabs] = useState<TabInstance[]>([
    {
      id: 'tab1',
      name: 'Tab 1 (User A)',
      userId: 'user-a',
      conversationId: 'conv-1',
      isActive: true,
      isVisible: true,
      messageCount: 0,
      lastActivity: new Date(),
    },
  ]);

  const [activeTabId, setActiveTabId] = useState('tab1');
  const [messages, setMessages] = useState<SimulatedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTabName, setNewTabName] = useState('');
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);

  // WebSocket connection for the active tab
  const { isConnected, joinConversation, leaveConversation, service } =
    useWebSocket({
      autoConnect: true,
      userId: tabs.find((t) => t.id === activeTabId)?.userId,
    });

  // Notification handling
  const notifications = useMessageNotifications(
    tabs.find((t) => t.id === activeTabId)?.conversationId,
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Simulate tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabs((prev) =>
        prev.map((tab) => ({
          ...tab,
          isVisible: tab.id === activeTabId ? !document.hidden : false,
        })),
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTabId]);

  // Join conversation when active tab changes
  useEffect(() => {
    if (activeTab && isConnected) {
      joinConversation(activeTab.conversationId);

      return () => {
        leaveConversation(activeTab.conversationId);
      };
    }
  }, [activeTab, isConnected, joinConversation, leaveConversation]);

  const addNewTab = () => {
    if (!newTabName) return;

    const newTab: TabInstance = {
      id: `tab-${Date.now()}`,
      name: newTabName,
      userId: `user-${Math.random().toString(36).substr(2, 4)}`,
      conversationId: `conv-${Math.floor(Math.random() * 3) + 1}`, // Random conv 1-3
      isActive: false,
      isVisible: false,
      messageCount: 0,
      lastActivity: new Date(),
    };

    setTabs((prev) => [...prev, newTab]);
    setNewTabName('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Keep at least one tab

    setTabs((prev) => prev.filter((t) => t.id !== tabId));

    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      setActiveTabId(remainingTabs[0]?.id || '');
    }
  };

  const switchTab = (tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
        isVisible: tab.id === tabId,
        lastActivity: tab.id === tabId ? new Date() : tab.lastActivity,
      })),
    );
    setActiveTabId(tabId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTab) return;

    const message: SimulatedMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      senderId: activeTab.userId,
      senderName: activeTab.name,
      conversationId: activeTab.conversationId,
      timestamp: new Date(),
      tabId: activeTab.id,
    };

    setMessages((prev) => [message, ...prev]);

    // Update tab message count
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              messageCount: tab.messageCount + 1,
              lastActivity: new Date(),
            }
          : tab,
      ),
    );

    // Send via WebSocket if connected (simplified for demo)
    if (isConnected && service) {
      console.log(
        `📤 Sending message via WebSocket: "${newMessage}" to ${activeTab.conversationId}`,
      );
    }

    setNewMessage('');

    // Simulate notifications for other tabs
    setTimeout(() => {
      simulateNotificationForOtherTabs(message);
    }, 100);
  };

  const simulateNotificationForOtherTabs = (message: SimulatedMessage) => {
    const otherTabs = tabs.filter(
      (tab) =>
        tab.id !== message.tabId &&
        tab.conversationId === message.conversationId &&
        !tab.isVisible,
    );

    otherTabs.forEach((tab) => {
      // Simulate notification (in real app this would come from WebSocket)
      console.log(
        `📱 Notification would show for ${tab.name}: "${message.content}"`,
      );
    });
  };

  const simulateTyping = () => {
    if (!activeTab || !isConnected) return;

    setIsSimulatingTyping(true);

    // Send typing start (simplified for demo)
    console.log(
      `⌨️ ${activeTab.name} started typing in ${activeTab.conversationId}`,
    );

    setTimeout(() => {
      console.log(
        `⌨️ ${activeTab.name} stopped typing in ${activeTab.conversationId}`,
      );
      setIsSimulatingTyping(false);
    }, 3000);
  };

  const toggleTabVisibility = (tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, isVisible: !tab.isVisible } : tab,
      ),
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4" />
          Multi-Tab Simulation ({tabs.length} tabs)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Tab */}
        <div className="flex gap-2">
          <Input
            placeholder="New tab name"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            className="flex-1 h-8 text-xs"
            onKeyPress={(e) => e.key === 'Enter' && addNewTab()}
          />
          <Button size="sm" onClick={addNewTab} className="h-8 px-2">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Tab List */}
        <ScrollArea className="h-32 w-full border rounded">
          <div className="p-2 space-y-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                  tab.id === activeTabId
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => switchTab(tab.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1">
                    {tab.isVisible ? (
                      <Eye className="h-3 w-3 text-green-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="font-medium">{tab.name}</span>
                  </div>
                  <Badge variant="outline" className="h-4 px-1 text-xs">
                    {tab.conversationId}
                  </Badge>
                  <Badge variant="secondary" className="h-4 px-1 text-xs">
                    {tab.messageCount} msgs
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTabVisibility(tab.id);
                    }}
                    className="h-5 w-5 p-0"
                  >
                    {tab.isVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  {tabs.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Active Tab Controls */}
        {activeTab && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Active: {activeTab.name}
              </Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isConnected ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {activeTab.conversationId}
                </Badge>
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-8 text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="h-8 px-2"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={simulateTyping}
                  disabled={isSimulatingTyping || !isConnected}
                  className="h-7 px-2 text-xs"
                >
                  {isSimulatingTyping ? 'Typing...' : 'Simulate Typing'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => notifications.requestPermission()}
                  className="h-7 px-2 text-xs"
                >
                  Request Notifications
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Message History */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Recent Messages ({messages.length})
          </Label>
          <ScrollArea className="h-32 w-full border rounded">
            <div className="p-2 space-y-1">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No messages yet
                </p>
              ) : (
                messages.slice(0, 20).map((message) => (
                  <div
                    key={message.id}
                    className="text-xs border-l-2 border-blue-200 pl-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.senderName}</span>
                      <Badge variant="outline" className="h-3 px-1 text-xs">
                        {message.conversationId}
                      </Badge>
                      <span className="text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
