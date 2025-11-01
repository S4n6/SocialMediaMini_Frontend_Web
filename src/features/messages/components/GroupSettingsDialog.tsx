'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  Users,
  Settings,
  Shield,
  Bell,
  Clock,
  Trash2,
  Copy,
  RefreshCw,
  Link,
  Lock,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupChat, GroupSettings } from '../types/group';

interface GroupSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupChat;
  currentUserId: string;
  isAdmin: boolean;
  onUpdateGroup: (updates: Partial<GroupChat>) => Promise<void>;
  onDeleteGroup: () => Promise<void>;
  onLeaveGroup: () => Promise<void>;
}

export function GroupSettingsDialog({
  isOpen,
  onClose,
  group,
  currentUserId,
  isAdmin,
  onUpdateGroup,
  onDeleteGroup,
  onLeaveGroup,
}: GroupSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [groupData, setGroupData] = useState<GroupChat>({ ...group });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setGroupData((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await onUpdateGroup(groupData);
      toast.success('Group settings updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update group settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await onDeleteGroup();
      toast.success('Group deleted successfully');
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await onLeaveGroup();
      toast.success('Left group successfully');
      setShowLeaveDialog(false);
      onClose();
    } catch (error) {
      toast.error('Failed to leave group');
    }
  };

  const generateNewInviteCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupData((prev) => ({ ...prev, inviteCode: newCode }));
    toast.success('New invite code generated');
  };

  const copyInviteLink = () => {
    if (groupData.inviteCode) {
      const inviteLink = `${window.location.origin}/groups/join/${groupData.inviteCode}`;
      navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied!');
    }
  };

  const updateSettings = (key: keyof GroupSettings, value: any) => {
    setGroupData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Group Avatar */}
      {isAdmin && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={groupData.avatar} />
              <AvatarFallback className="text-lg">
                <Users className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      )}

      {/* Group Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={groupData.name}
            onChange={(e) =>
              setGroupData((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={!isAdmin && !groupData.settings.allowMembersToEditGroup}
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="group-description">Description</Label>
          <Textarea
            id="group-description"
            value={groupData.description || ''}
            onChange={(e) =>
              setGroupData((prev) => ({ ...prev, description: e.target.value }))
            }
            disabled={!isAdmin && !groupData.settings.allowMembersToEditGroup}
            maxLength={200}
            rows={3}
          />
        </div>

        {/* Group Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{group.memberCount}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {new Date(group.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Private Group</Label>
              <p className="text-sm text-muted-foreground">
                Only invited members can join
              </p>
            </div>
            <Switch
              checked={groupData.isPrivate}
              onCheckedChange={(checked) =>
                setGroupData((prev) => ({ ...prev, isPrivate: checked }))
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require approval to join</Label>
              <p className="text-sm text-muted-foreground">
                Admins must approve new members
              </p>
            </div>
            <Switch
              checked={groupData.settings.requireApprovalToJoin}
              onCheckedChange={(checked) =>
                updateSettings('requireApprovalToJoin', checked)
              }
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invite Link */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Link className="mr-2 h-4 w-4" />
              Invite Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={groupData.inviteCode || ''}
                readOnly
                className="font-mono"
              />
              <Button variant="outline" size="sm" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateNewInviteCode}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to invite new members. Generate a new code to
              invalidate the old one.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Member Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Members can add others</Label>
              <p className="text-sm text-muted-foreground">
                Allow members to invite new people
              </p>
            </div>
            <Switch
              checked={groupData.settings.allowMembersToAddOthers}
              onCheckedChange={(checked) =>
                updateSettings('allowMembersToAddOthers', checked)
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Members can edit group info</Label>
              <p className="text-sm text-muted-foreground">
                Allow members to change group details
              </p>
            </div>
            <Switch
              checked={groupData.settings.allowMembersToEditGroup}
              onCheckedChange={(checked) =>
                updateSettings('allowMembersToEditGroup', checked)
              }
              disabled={!isAdmin}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Only admins can message</Label>
              <p className="text-sm text-muted-foreground">
                Restrict messaging to administrators only
              </p>
            </div>
            <Switch
              checked={groupData.settings.onlyAdminsCanMessage}
              onCheckedChange={(checked) =>
                updateSettings('onlyAdminsCanMessage', checked)
              }
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      {/* Group Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Group Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Maximum Members</Label>
            <Select
              value={groupData.settings.maxMembers.toString()}
              onValueChange={(value) =>
                updateSettings('maxMembers', parseInt(value))
              }
              disabled={!isAdmin}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 members</SelectItem>
                <SelectItem value="100">100 members</SelectItem>
                <SelectItem value="250">250 members</SelectItem>
                <SelectItem value="500">500 members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mute notifications</Label>
              <p className="text-sm text-muted-foreground">
                Don't receive notifications from this group
              </p>
            </div>
            <Switch
              checked={groupData.settings.muteNotifications}
              onCheckedChange={(checked) =>
                updateSettings('muteNotifications', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Disappearing Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Disappearing Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable disappearing messages</Label>
              <p className="text-sm text-muted-foreground">
                Messages will automatically be deleted after a set time
              </p>
            </div>
            <Switch
              checked={groupData.settings.disappearingMessages}
              onCheckedChange={(checked) =>
                updateSettings('disappearingMessages', checked)
              }
              disabled={!isAdmin}
            />
          </div>

          {groupData.settings.disappearingMessages && (
            <div className="space-y-2">
              <Label>Delete messages after</Label>
              <Select
                value={
                  groupData.settings.disappearingDuration?.toString() || '1440'
                }
                onValueChange={(value) =>
                  updateSettings('disappearingDuration', parseInt(value))
                }
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                  <SelectItem value="10080">7 days</SelectItem>
                  <SelectItem value="43200">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-6">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center">
            <Trash2 className="mr-2 h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Leave Group</p>
                <p className="text-sm text-muted-foreground">
                  You will no longer receive messages from this group
                </p>
              </div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowLeaveDialog(true)}
              >
                Leave Group
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
              <div>
                <p className="font-medium text-destructive">Delete Group</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this group and all its messages. This
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Group Settings</DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="danger">Danger</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="general" className="mt-0">
                {renderGeneralTab()}
              </TabsContent>
              <TabsContent value="privacy" className="mt-0">
                {renderPrivacyTab()}
              </TabsContent>
              <TabsContent value="permissions" className="mt-0">
                {renderPermissionsTab()}
              </TabsContent>
              <TabsContent value="notifications" className="mt-0">
                {renderNotificationsTab()}
              </TabsContent>
              <TabsContent value="danger" className="mt-0">
                {renderDangerZone()}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{group.name}"? This will
              permanently remove the group and all its messages. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Group Confirmation */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{group.name}"? You will no longer
              receive messages from this group and will need to be re-invited to
              join again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
