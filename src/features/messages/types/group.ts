export interface GroupMember {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isOnline?: boolean;
  lastSeen?: string;
  permissions?: GroupPermissions;
}

export interface GroupPermissions {
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canEditGroup: boolean;
  canDeleteMessages: boolean;
  canPinMessages: boolean;
  canManageRoles: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  memberCount: number;
  isPrivate: boolean;
  inviteCode?: string;
  settings: GroupSettings;
  members: GroupMember[];
}

export interface GroupSettings {
  allowMembersToAddOthers: boolean;
  allowMembersToEditGroup: boolean;
  onlyAdminsCanMessage: boolean;
  muteNotifications: boolean;
  disappearingMessages: boolean;
  disappearingDuration?: number; // minutes
  maxMembers: number;
  requireApprovalToJoin: boolean;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  invitedBy: string;
  invitedUser: string;
  inviteCode: string;
  expiresAt?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  type:
    | 'member_joined'
    | 'member_left'
    | 'member_removed'
    | 'role_changed'
    | 'group_updated'
    | 'message_pinned';
  performedBy: string;
  targetUser?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Default permissions for different roles
export const DEFAULT_PERMISSIONS: Record<
  GroupMember['role'],
  GroupPermissions
> = {
  admin: {
    canAddMembers: true,
    canRemoveMembers: true,
    canEditGroup: true,
    canDeleteMessages: true,
    canPinMessages: true,
    canManageRoles: true,
  },
  moderator: {
    canAddMembers: true,
    canRemoveMembers: false,
    canEditGroup: false,
    canDeleteMessages: true,
    canPinMessages: true,
    canManageRoles: false,
  },
  member: {
    canAddMembers: false,
    canRemoveMembers: false,
    canEditGroup: false,
    canDeleteMessages: false,
    canPinMessages: false,
    canManageRoles: false,
  },
};
