'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Users,
  Clock,
  Check,
  X,
  Crown,
  Shield,
  Lock,
  Mail,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupInvite, GroupChat } from '../types/group';

interface GroupInvitationsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function GroupInvitations({
  isOpen,
  onClose,
  currentUserId,
}: GroupInvitationsProps) {
  const [selectedInvite, setSelectedInvite] = useState<GroupInvite | null>(
    null,
  );
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock invitation data
  const [invitations, setInvitations] = useState<GroupInvite[]>([
    {
      id: 'invite1',
      groupId: 'group1',
      invitedBy: 'user2',
      invitedUser: currentUserId,
      inviteCode: 'DEV2024',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'invite2',
      groupId: 'group2',
      invitedBy: 'user3',
      invitedUser: currentUserId,
      inviteCode: 'DESIGN01',
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Mock group data for display
  const mockGroups: Record<string, Partial<GroupChat>> = {
    group1: {
      id: 'group1',
      name: 'Development Team',
      description: 'Our awesome development team chat',
      avatar: '',
      memberCount: 12,
      isPrivate: false,
    },
    group2: {
      id: 'group2',
      name: 'Design Team',
      description: 'Creative design discussions',
      avatar: '',
      memberCount: 8,
      isPrivate: true,
    },
  };

  // Mock user data
  const mockUsers: Record<string, any> = {
    user2: {
      id: 'user2',
      username: 'john_doe',
      displayName: 'John Doe',
      avatar: '',
      role: 'admin',
    },
    user3: {
      id: 'user3',
      username: 'alice_design',
      displayName: 'Alice Designer',
      avatar: '',
      role: 'moderator',
    },
  };

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === 'pending',
  );

  const handleAcceptInvite = async (invite: GroupInvite) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invite.id ? { ...inv, status: 'accepted' as const } : inv,
        ),
      );

      const group = mockGroups[invite.groupId];
      toast.success(`Joined "${group?.name}" successfully!`);
      setShowAcceptDialog(false);
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setIsLoading(false);
      setSelectedInvite(null);
    }
  };

  const handleDeclineInvite = async (invite: GroupInvite) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invite.id ? { ...inv, status: 'declined' as const } : inv,
        ),
      );

      toast.success('Invitation declined');
      setShowDeclineDialog(false);
    } catch (error) {
      toast.error('Failed to decline invitation');
    } finally {
      setIsLoading(false);
      setSelectedInvite(null);
    }
  };

  const getStatusBadge = (status: GroupInvite['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return null;
    }
  };

  const isExpired = (invite: GroupInvite) => {
    if (!invite.expiresAt) return false;
    return new Date(invite.expiresAt) < new Date();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Group Invitations ({pendingInvitations.length})
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No group invitations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invite) => {
                  const group = mockGroups[invite.groupId];
                  const inviter = mockUsers[invite.invitedBy];
                  const expired = isExpired(invite);

                  return (
                    <Card
                      key={invite.id}
                      className={expired ? 'opacity-60' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={group?.avatar} />
                                <AvatarFallback>
                                  <Users className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              {group?.isPrivate && (
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background rounded-full flex items-center justify-center">
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium">{group?.name}</h3>
                                {getStatusBadge(invite.status)}
                                {expired && (
                                  <Badge variant="outline">Expired</Badge>
                                )}
                              </div>

                              {group?.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {group.description}
                                </p>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {group?.memberCount} members
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(invite.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={inviter?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {inviter?.displayName
                                      ?.split(' ')
                                      .map((n: string) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  Invited by {inviter?.displayName}
                                </span>
                                {inviter?.role === 'admin' && (
                                  <Crown className="h-3 w-3 text-yellow-500" />
                                )}
                                {inviter?.role === 'moderator' && (
                                  <Shield className="h-3 w-3 text-blue-500" />
                                )}
                              </div>

                              {invite.expiresAt && !expired && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Expires:{' '}
                                  {new Date(
                                    invite.expiresAt,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {invite.status === 'pending' && !expired && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInvite(invite);
                                  setShowDeclineDialog(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedInvite(invite);
                                  setShowAcceptDialog(true);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept Invitation Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Group Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to join "
              {mockGroups[selectedInvite?.groupId || '']?.name}"? You will be
              able to see all messages and participate in the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedInvite && handleAcceptInvite(selectedInvite)
              }
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Accept & Join'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Invitation Dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Group Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline the invitation to join "
              {mockGroups[selectedInvite?.groupId || '']?.name}"? You can still
              be invited again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedInvite && handleDeclineInvite(selectedInvite)
              }
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Declining...' : 'Decline'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
