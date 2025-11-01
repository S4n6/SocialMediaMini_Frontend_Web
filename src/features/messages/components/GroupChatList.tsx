'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Users,
  Crown,
  Shield,
  User,
  MoreVertical,
  Settings,
  UserPlus,
  MessageCircle,
  Lock,
  Globe,
  Clock,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupChat, GroupMember } from '../types/group';
import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupMembersManager } from './GroupMembersManager';
import { GroupSettingsDialog } from './GroupSettingsDialog';

interface GroupChatListProps {
  currentUserId: string;
  onSelectGroup: (groupId: string) => void;
  selectedGroupId?: string;
  onShowInvitations?: () => void;
}

export function GroupChatList({
  currentUserId,
  onSelectGroup,
  selectedGroupId,
  onShowInvitations,
}: GroupChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [groups, setGroups] = useState<GroupChat[]>([
    // Mock data
    {
      id: 'group1',
      name: 'Development Team',
      description: 'Our awesome development team chat',
      avatar: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user1',
      memberCount: 12,
      isPrivate: false,
      inviteCode: 'DEV2024',
      settings: {
        allowMembersToAddOthers: true,
        allowMembersToEditGroup: false,
        onlyAdminsCanMessage: false,
        muteNotifications: false,
        disappearingMessages: false,
        maxMembers: 100,
        requireApprovalToJoin: false,
      },
      members: [
        {
          id: 'member1',
          userId: currentUserId,
          username: 'you',
          displayName: 'You',
          avatar: '',
          role: 'admin',
          joinedAt: new Date().toISOString(),
          isOnline: true,
        },
        {
          id: 'member2',
          userId: 'user2',
          username: 'john_doe',
          displayName: 'John Doe',
          avatar: '',
          role: 'moderator',
          joinedAt: new Date().toISOString(),
          isOnline: true,
        },
        {
          id: 'member3',
          userId: 'user3',
          username: 'jane_smith',
          displayName: 'Jane Smith',
          avatar: '',
          role: 'member',
          joinedAt: new Date().toISOString(),
          isOnline: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'group2',
      name: 'Project Alpha',
      description: 'Secret project discussion',
      avatar: '',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user2',
      memberCount: 5,
      isPrivate: true,
      inviteCode: 'ALPHA01',
      settings: {
        allowMembersToAddOthers: false,
        allowMembersToEditGroup: false,
        onlyAdminsCanMessage: true,
        muteNotifications: false,
        disappearingMessages: true,
        disappearingDuration: 1440,
        maxMembers: 10,
        requireApprovalToJoin: true,
      },
      members: [
        {
          id: 'member4',
          userId: currentUserId,
          username: 'you',
          displayName: 'You',
          avatar: '',
          role: 'member',
          joinedAt: new Date().toISOString(),
          isOnline: true,
        },
      ],
    },
  ]);

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCurrentUserRole = (group: GroupChat): GroupMember['role'] | null => {
    const member = group.members.find((m) => m.userId === currentUserId);
    return member?.role || null;
  };

  const isAdmin = (group: GroupChat): boolean => {
    return getCurrentUserRole(group) === 'admin';
  };

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleCreateGroup = async (groupData: Partial<GroupChat>) => {
    const newGroup: GroupChat = {
      id: `group_${Date.now()}`,
      name: groupData.name || '',
      description: groupData.description,
      avatar: groupData.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId,
      memberCount: (groupData.members?.length || 0) + 1, // +1 for creator
      isPrivate: groupData.isPrivate || false,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      settings: groupData.settings || {
        allowMembersToAddOthers: true,
        allowMembersToEditGroup: false,
        onlyAdminsCanMessage: false,
        muteNotifications: false,
        disappearingMessages: false,
        maxMembers: 100,
        requireApprovalToJoin: false,
      },
      members: [
        {
          id: `member_${currentUserId}`,
          userId: currentUserId,
          username: 'you',
          displayName: 'You',
          avatar: '',
          role: 'admin',
          joinedAt: new Date().toISOString(),
          isOnline: true,
        },
        ...(groupData.members || []),
      ],
    };

    setGroups((prev) => [...prev, newGroup]);
  };

  const handleUpdateGroup = async (
    groupId: string,
    updates: Partial<GroupChat>,
  ) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group,
      ),
    );
  };

  const handleDeleteGroup = async (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const handleLeaveGroup = async (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const handleUpdateMember = async (
    groupId: string,
    memberId: string,
    updates: Partial<GroupMember>,
  ) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.map((member) =>
              member.id === memberId ? { ...member, ...updates } : member,
            ),
          };
        }
        return group;
      }),
    );
  };

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter((member) => member.id !== memberId),
            memberCount: group.memberCount - 1,
          };
        }
        return group;
      }),
    );
  };

  const handleInviteMembers = async (groupId: string, emails: string[]) => {
    // Mock implementation
    toast.success(`Invitations sent to ${emails.length} people`);
  };

  const openMembersDialog = (group: GroupChat) => {
    setSelectedGroup(group);
    setShowMembersDialog(true);
  };

  const openSettingsDialog = (group: GroupChat) => {
    setSelectedGroup(group);
    setShowSettingsDialog(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Groups</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowInvitations}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowCreateDialog(true)}
              >
                Create your first group
              </Button>
            )}
          </div>
        ) : (
          filteredGroups.map((group) => {
            const userRole = getCurrentUserRole(group);
            const isGroupAdmin = isAdmin(group);

            return (
              <Card
                key={group.id}
                className={`transition-all hover:shadow-md cursor-pointer ${
                  selectedGroupId === group.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex items-start space-x-3 flex-1"
                      onClick={() => onSelectGroup(group.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback>
                            <Users className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {group.isPrivate && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">{group.name}</h3>
                          {userRole && (
                            <Badge variant="outline" className="text-xs">
                              {getRoleIcon(userRole)}
                              <span className="ml-1">{userRole}</span>
                            </Badge>
                          )}
                          {group.settings.disappearingMessages && (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>

                        {group.description && (
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {group.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {group.memberCount} members
                          </span>
                          <span>
                            Created{' '}
                            {new Date(group.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onSelectGroup(group.id)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Open Chat
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openMembersDialog(group)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Manage Members
                        </DropdownMenuItem>

                        {(isGroupAdmin ||
                          group.settings.allowMembersToEditGroup) && (
                          <DropdownMenuItem
                            onClick={() => openSettingsDialog(group)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Group Settings
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateGroup={handleCreateGroup}
      />

      {selectedGroup && (
        <>
          <GroupMembersManager
            isOpen={showMembersDialog}
            onClose={() => {
              setShowMembersDialog(false);
              setSelectedGroup(null);
            }}
            group={selectedGroup}
            currentUserId={currentUserId}
            onUpdateMember={(memberId, updates) =>
              handleUpdateMember(selectedGroup.id, memberId, updates)
            }
            onRemoveMember={(memberId) =>
              handleRemoveMember(selectedGroup.id, memberId)
            }
            onInviteMembers={(emails) =>
              handleInviteMembers(selectedGroup.id, emails)
            }
          />

          <GroupSettingsDialog
            isOpen={showSettingsDialog}
            onClose={() => {
              setShowSettingsDialog(false);
              setSelectedGroup(null);
            }}
            group={selectedGroup}
            currentUserId={currentUserId}
            isAdmin={isAdmin(selectedGroup)}
            onUpdateGroup={(updates) =>
              handleUpdateGroup(selectedGroup.id, updates)
            }
            onDeleteGroup={() => handleDeleteGroup(selectedGroup.id)}
            onLeaveGroup={() => handleLeaveGroup(selectedGroup.id)}
          />
        </>
      )}
    </div>
  );
}
