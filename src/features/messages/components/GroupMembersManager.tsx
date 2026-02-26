'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  MoreVertical,
  Crown,
  Shield,
  User,
  UserPlus,
  UserMinus,
  Ban,
  Settings,
  Copy,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupMember, GroupChat, DEFAULT_PERMISSIONS } from '../types/group';

interface GroupMembersManagerProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChat;
  currentUserId: string;
  onUpdateMember: (
    memberId: string,
    updates: Partial<GroupMember>,
  ) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onInviteMembers: (emails: string[]) => Promise<void>;
}

export function GroupMembersManager({
  isOpen,
  onClose,
  group,
  currentUserId,
  onUpdateMember,
  onRemoveMember,
  onInviteMembers,
}: GroupMembersManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null,
  );
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');

  const currentUserMember = group.members.find(
    (m) => m.userId === currentUserId,
  );
  const isCurrentUserAdmin = currentUserMember?.role === 'admin';
  const isCurrentUserModerator = ['admin', 'moderator'].includes(
    currentUserMember?.role || '',
  );

  const filteredMembers = group.members.filter(
    (member) =>
      member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: GroupMember['role']) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'moderator':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const canManageMember = (member: GroupMember) => {
    if (member.userId === currentUserId) return false;
    if (!isCurrentUserModerator) return false;
    if (member.role === 'admin' && currentUserMember?.role !== 'admin')
      return false;
    return true;
  };

  const handleRoleChange = async (
    member: GroupMember,
    newRole: GroupMember['role'],
  ) => {
    try {
      await onUpdateMember(member.id, {
        role: newRole,
        permissions: DEFAULT_PERMISSIONS[newRole],
      });
      toast.success(`${member.displayName}'s role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      await onRemoveMember(selectedMember.id);
      toast.success(`${selectedMember.displayName} removed from group`);
      setShowRemoveDialog(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleInviteMembers = async () => {
    const emails = inviteEmails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'));

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    try {
      await onInviteMembers(emails);
      toast.success(`Invitations sent to ${emails.length} people`);
      setShowInviteDialog(false);
      setInviteEmails('');
    } catch (error) {
      toast.error('Failed to send invitations');
    }
  };

  const copyInviteLink = () => {
    if (group.inviteCode) {
      const inviteLink = `${window.location.origin}/groups/join/${group.inviteCode}`;
      navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied!');
    }
  };

  const generateInviteCode = () => {
    // Mock generating invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    toast.success('New invite code generated');
    return code;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Group Members ({group.memberCount})</span>
              {isCurrentUserModerator && (
                <Button
                  size="sm"
                  onClick={() => setShowInviteDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite</span>
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="pl-10"
              />
            </div>

            {/* Invite Link Section */}
            {isCurrentUserAdmin && group.inviteCode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Invite Link</p>
                    <p className="text-xs text-muted-foreground">
                      Share this link to invite new members
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyInviteLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateInviteCode}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{member.displayName}</p>
                        {member.userId === currentUserId && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          @{member.username}
                        </p>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="text-xs"
                        >
                          <span className="mr-1">
                            {getRoleIcon(member.role)}
                          </span>
                          {member.role}
                        </Badge>
                      </div>
                      {!member.isOnline && member.lastSeen && (
                        <p className="text-xs text-muted-foreground">
                          Last seen{' '}
                          {new Date(member.lastSeen).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {canManageMember(member) && (
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
                        <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {isCurrentUserAdmin && member.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member, 'admin')}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}

                        {isCurrentUserAdmin && member.role !== 'moderator' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(member, 'moderator')
                            }
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Moderator
                          </DropdownMenuItem>
                        )}

                        {isCurrentUserAdmin && member.role !== 'member' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member, 'member')}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Make Member
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRemoveDialog(true);
                          }}
                          className="text-destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.displayName} from
              this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Members Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email addresses</label>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas or new lines..."
                className="w-full mt-1 p-2 border rounded-md h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can enter multiple email addresses separated by commas or
                line breaks
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleInviteMembers}>Send Invitations</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
