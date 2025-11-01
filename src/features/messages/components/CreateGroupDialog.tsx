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
  Upload,
  Users,
  Settings,
  Crown,
  Shield,
  User,
  Camera,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { GroupChat, GroupSettings } from '../types/group';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: Partial<GroupChat>) => Promise<void>;
}

export function CreateGroupDialog({
  isOpen,
  onClose,
  onCreateGroup,
}: CreateGroupDialogProps) {
  const [step, setStep] = useState<'basic' | 'settings' | 'members'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [groupData, setGroupData] = useState<Partial<GroupChat>>({
    name: '',
    description: '',
    avatar: '',
    isPrivate: false,
    settings: {
      allowMembersToAddOthers: true,
      allowMembersToEditGroup: false,
      onlyAdminsCanMessage: false,
      muteNotifications: false,
      disappearingMessages: false,
      maxMembers: 100,
      requireApprovalToJoin: false,
    },
    members: [],
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user data for member selection
  const mockUsers = [
    { id: '1', username: 'john_doe', displayName: 'John Doe', avatar: '' },
    { id: '2', username: 'jane_smith', displayName: 'Jane Smith', avatar: '' },
    { id: '3', username: 'bob_wilson', displayName: 'Bob Wilson', avatar: '' },
    {
      id: '4',
      username: 'alice_brown',
      displayName: 'Alice Brown',
      avatar: '',
    },
    {
      id: '5',
      username: 'charlie_davis',
      displayName: 'Charlie Davis',
      avatar: '',
    },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      user.username.toLowerCase().includes(memberSearch.toLowerCase()),
  );

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

  const handleNext = () => {
    if (step === 'basic') {
      if (!groupData.name?.trim()) {
        toast.error('Group name is required');
        return;
      }
      setStep('settings');
    } else if (step === 'settings') {
      setStep('members');
    }
  };

  const handleBack = () => {
    if (step === 'settings') {
      setStep('basic');
    } else if (step === 'members') {
      setStep('settings');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupData.name?.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsLoading(true);
    try {
      const finalGroupData = {
        ...groupData,
        members: selectedMembers.map((userId) => {
          const user = mockUsers.find((u) => u.id === userId);
          return {
            id: `member_${userId}`,
            userId,
            username: user?.username || '',
            displayName: user?.displayName || '',
            avatar: user?.avatar,
            role: 'member' as const,
            joinedAt: new Date().toISOString(),
            isOnline: false,
          };
        }),
      };

      await onCreateGroup(finalGroupData);
      toast.success('Group created successfully!');
      onClose();

      // Reset form
      setGroupData({
        name: '',
        description: '',
        avatar: '',
        isPrivate: false,
        settings: {
          allowMembersToAddOthers: true,
          allowMembersToEditGroup: false,
          onlyAdminsCanMessage: false,
          muteNotifications: false,
          disappearingMessages: false,
          maxMembers: 100,
          requireApprovalToJoin: false,
        },
        members: [],
      });
      setSelectedMembers([]);
      setStep('basic');
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Group Avatar */}
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

      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="group-name">Group Name *</Label>
        <Input
          id="group-name"
          value={groupData.name || ''}
          onChange={(e) =>
            setGroupData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter group name"
          maxLength={50}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="group-description">Description</Label>
        <Textarea
          id="group-description"
          value={groupData.description || ''}
          onChange={(e) =>
            setGroupData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="What's this group about?"
          maxLength={200}
          rows={3}
        />
      </div>

      {/* Privacy */}
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
        />
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {/* Member Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Member Permissions</CardTitle>
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
                checked={groupData.settings?.allowMembersToAddOthers}
                onCheckedChange={(checked) =>
                  setGroupData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings!,
                      allowMembersToAddOthers: checked,
                    },
                  }))
                }
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
                checked={groupData.settings?.allowMembersToEditGroup}
                onCheckedChange={(checked) =>
                  setGroupData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings!,
                      allowMembersToEditGroup: checked,
                    },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Only admins can message</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict messaging to administrators
                </p>
              </div>
              <Switch
                checked={groupData.settings?.onlyAdminsCanMessage}
                onCheckedChange={(checked) =>
                  setGroupData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings!,
                      onlyAdminsCanMessage: checked,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Group Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Group Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum Members</Label>
              <Select
                value={groupData.settings?.maxMembers?.toString()}
                onValueChange={(value) =>
                  setGroupData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings!,
                      maxMembers: parseInt(value),
                    },
                  }))
                }
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require approval to join</Label>
                <p className="text-sm text-muted-foreground">
                  Admins must approve new members
                </p>
              </div>
              <Switch
                checked={groupData.settings?.requireApprovalToJoin}
                onCheckedChange={(checked) =>
                  setGroupData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings!,
                      requireApprovalToJoin: checked,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMemberSelection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Add Members</Label>
        <Input
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search users..."
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
            <Button
              variant={
                selectedMembers.includes(user.id) ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => toggleMemberSelection(user.id)}
            >
              {selectedMembers.includes(user.id) ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {selectedMembers.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">
            Selected Members ({selectedMembers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((userId) => {
              const user = mockUsers.find((u) => u.id === userId);
              return (
                <div
                  key={userId}
                  className="flex items-center space-x-1 bg-background px-2 py-1 rounded-md"
                >
                  <span className="text-sm">{user?.displayName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => toggleMemberSelection(userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'basic' && 'Create New Group'}
            {step === 'settings' && 'Group Settings'}
            {step === 'members' && 'Add Members'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 'basic' && renderBasicInfo()}
          {step === 'settings' && renderSettings()}
          {step === 'members' && renderMemberSelection()}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step !== 'basic' && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step !== 'members' ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleCreateGroup} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
