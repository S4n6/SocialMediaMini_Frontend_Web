'use client';

import React, { useState } from 'react';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { GroupChatList } from '@/features/messages/components/GroupChatList';
import { GroupInvitations } from '@/features/messages/components/GroupInvitations';
import { MessageList } from '@/features/messages/components/MessageList';
import MessageInput from '@/features/messages/components/MessageInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Users,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Crown,
  Shield,
  Lock,
  Clock,
  Mail,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock group data for selected group display
const mockSelectedGroup = {
  id: 'group1',
  name: 'Development Team',
  description: 'Our awesome development team chat',
  avatar: '',
  memberCount: 12,
  isPrivate: false,
  settings: {
    onlyAdminsCanMessage: false,
    disappearingMessages: false,
  },
  members: [
    {
      id: 'member1',
      userId: '1',
      username: 'you',
      displayName: 'You',
      role: 'admin' as const,
      isOnline: true,
    },
    {
      id: 'member2',
      userId: '2',
      username: 'john_doe',
      displayName: 'John Doe',
      role: 'moderator' as const,
      isOnline: true,
    },
    {
      id: 'member3',
      userId: '3',
      username: 'jane_smith',
      displayName: 'Jane Smith',
      role: 'member' as const,
      isOnline: false,
    },
  ],
};

export default function GroupChatPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupList, setShowGroupList] = useState(true);
  const [showInvitations, setShowInvitations] = useState(false);

  const currentUserId = '1'; // Mock current user ID

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowGroupList(false);
    toast.success(`Opened group chat: ${groupId}`);
  };

  const handleBackToGroups = () => {
    setSelectedGroupId(null);
    setShowGroupList(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderGroupChatHeader = () => {
    if (!selectedGroupId) return null;

    return (
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={handleBackToGroups}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockSelectedGroup.avatar} />
              <AvatarFallback>
                <Users className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            {mockSelectedGroup.isPrivate && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-background rounded-full flex items-center justify-center">
                <Lock className="h-2 w-2 text-muted-foreground" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold">{mockSelectedGroup.name}</h1>
              {mockSelectedGroup.settings.disappearingMessages && (
                <Clock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{mockSelectedGroup.memberCount} members</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {mockSelectedGroup.members.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center space-x-1">
                    <span>{member.displayName}</span>
                    {getRoleIcon(member.role)}
                  </div>
                ))}
                {mockSelectedGroup.memberCount > 3 && (
                  <span>+{mockSelectedGroup.memberCount - 3} more</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderGroupChat = () => {
    if (!selectedGroupId) return null;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <MessageList
            conversationId={selectedGroupId}
            currentUserId={currentUserId}
            useApi={false}
          />
        </div>

        {/* Group Features Demo */}
        <div className="p-4 border-t bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-card rounded-lg">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                Admin Controls
              </h4>
              <p className="text-xs text-muted-foreground">
                Create groups, manage members, set permissions, and configure
                settings
              </p>
            </div>

            <div className="p-3 bg-card rounded-lg">
              <h4 className="text-sm font-medium flex items-center mb-2">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                Role-based Permissions
              </h4>
              <p className="text-xs text-muted-foreground">
                Different roles (Admin, Moderator, Member) with specific
                permissions
              </p>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t bg-background">
          <MessageInput
            conversationId={selectedGroupId}
            placeholder={
              mockSelectedGroup.settings.onlyAdminsCanMessage
                ? 'Only admins can send messages in this group'
                : 'Message to ' + mockSelectedGroup.name + '...'
            }
            disabled={
              mockSelectedGroup.settings.onlyAdminsCanMessage &&
              mockSelectedGroup.members.find((m) => m.userId === currentUserId)
                ?.role !== 'admin'
            }
            useApi={false}
            useWebSocket={false}
          />
        </div>
      </div>
    );
  };

  return (
    <ConditionalLayout>
      <div className="h-screen flex bg-background">
        {/* Groups Sidebar - Desktop always visible, mobile conditional */}
        <div
          className={`w-80 border-r bg-card ${showGroupList ? 'block' : 'hidden md:block'}`}
        >
          <GroupChatList
            currentUserId={currentUserId}
            onSelectGroup={handleSelectGroup}
            selectedGroupId={selectedGroupId || undefined}
            onShowInvitations={() => setShowInvitations(true)}
          />
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${selectedGroupId ? 'block' : 'hidden md:flex'}`}
        >
          {selectedGroupId ? (
            <>
              {renderGroupChatHeader()}
              {renderGroupChat()}
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center max-w-md">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Welcome to Group Chat
                </h3>
                <p className="text-muted-foreground mb-6">
                  Select a group from the sidebar to start chatting, or create a
                  new group to get started.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Admin controls for managing groups</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Role-based permissions system</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Member management and invitations</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span>Comprehensive group settings</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile overlay */}
        {!showGroupList && selectedGroupId && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleBackToGroups}
          />
        )}

        {/* Group Invitations Dialog */}
        <GroupInvitations
          isOpen={showInvitations}
          onClose={() => setShowInvitations(false)}
          currentUserId={currentUserId}
        />
      </div>
    </ConditionalLayout>
  );
}
