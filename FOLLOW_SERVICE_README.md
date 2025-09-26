# Follow Service Documentation

This documentation explains how to use the Follow Service and related components in your social media application.

## Overview

The Follow Service provides functionality for:

- Following/unfollowing users
- Getting followers and following lists
- Checking follow status between users
- Getting user statistics (followers/following counts)

## Files Created

1. **`src/services/followService.ts`** - Main service with API calls
2. **`src/hooks/useFollow.ts`** - React hooks for easy component integration
3. **`src/components/ui/FollowButton.tsx`** - Reusable follow button component
4. **`src/components/examples/FollowServiceExamples.tsx`** - Usage examples

## Quick Start

### 1. Simple Follow Button

The easiest way to add follow functionality:

```tsx
import { FollowButton } from "@/components/ui/FollowButton";

export const MyComponent = ({ userId }: { userId: string }) => {
  return <FollowButton targetUserId={userId} variant="default" size="sm" />;
};
```

### 2. Using Hooks Directly

For custom implementations:

```tsx
import { useFollowActions } from "@/hooks";

export const CustomFollowButton = ({ userId }: { userId: string }) => {
  const { isFollowing, isLoading, toggleFollow, error } =
    useFollowActions(userId);

  return (
    <button
      onClick={toggleFollow}
      disabled={isLoading}
      className={isFollowing ? "following-style" : "follow-style"}
    >
      {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};
```

## API Methods

### Follow Service Methods

```typescript
import { followService } from "@/services/followService";

// Follow a user
await followService.followUser(targetUserId);

// Unfollow a user
await followService.unfollowUser(targetUserId);

// Get followers of a user
await followService.getFollowers(userId);

// Get following list of a user
await followService.getFollowing(userId);

// Get current user's followers
await followService.getMyFollowers();

// Get current user's following
await followService.getMyFollowing();

// Check follow status with a user
await followService.checkFollowStatus(targetUserId);

// Get user stats
await followService.getUserStats(userId);

// Get current user's stats
await followService.getMyStats();
```

## React Hooks

### Query Hooks

```typescript
import {
  useFollowers,
  useFollowing,
  useFollowStatus,
  useUserStats,
} from "@/hooks";

// Get followers (pass userId for specific user, or nothing for current user)
const { data: followers, isLoading } = useFollowers(userId);

// Get following list
const { data: following, isLoading } = useFollowing(userId);

// Check follow status
const { data: status, isLoading } = useFollowStatus(targetUserId);

// Get user stats
const { data: stats, isLoading } = useUserStats(userId);
```

### Mutation Hooks

```typescript
import { useFollowUser, useUnfollowUser } from "@/hooks";

const followMutation = useFollowUser();
const unfollowMutation = useUnfollowUser();

// Follow a user
followMutation.mutate(targetUserId);

// Unfollow a user
unfollowMutation.mutate(targetUserId);
```

### Combined Hook

```typescript
import { useFollowActions } from "@/hooks";

const {
  isFollowing,
  isLoading,
  toggleFollow,
  followUser,
  unfollowUser,
  error,
} = useFollowActions(targetUserId);
```

## Components

### FollowButton Component

```tsx
interface FollowButtonProps {
  targetUserId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  followText?: string;
  followingText?: string;
  showLoading?: boolean;
}
```

**Usage Examples:**

```tsx
// Default button
<FollowButton targetUserId={userId} />

// Ghost variant (minimal styling)
<FollowButton targetUserId={userId} variant="ghost" />

// Custom text
<FollowButton
  targetUserId={userId}
  followText="Follow Back"
  followingText="Following"
/>

// Custom styling
<FollowButton
  targetUserId={userId}
  className="my-custom-styles"
  size="lg"
/>
```

### Updated Components

#### FriendSuggestionCard

Now accepts `userId` prop and uses `FollowButton`:

```tsx
<FriendSuggestionCard
  userId={user.id}
  name={user.fullName}
  username={user.userName}
  avatarUrl={user.avatar}
/>
```

#### ProfileInfo

Now accepts `profileUser` prop for better integration:

```tsx
<ProfileInfo
  profileUser={user}
  isOwnProfile={isOwnProfile}
  hasStoryRing={hasStory}
/>
```

## Error Handling

All hooks and services include proper error handling:

```tsx
const { data, isLoading, error } = useFollowers();

if (error) {
  console.error("Failed to load followers:", error);
  // Show error message to user
}
```

## Caching and Optimization

The hooks use React Query for:

- ✅ Automatic caching
- ✅ Background updates
- ✅ Optimistic updates
- ✅ Error retry
- ✅ Loading states

## Backend Integration

The service expects these backend endpoints:

```
POST   /friends/follow           - Follow a user
DELETE /friends/unfollow/:id     - Unfollow a user
GET    /friends/followers/:id    - Get user's followers
GET    /friends/following/:id    - Get user's following
GET    /friends/my-followers     - Get current user's followers
GET    /friends/my-following     - Get current user's following
GET    /friends/check-status/:id - Check follow status
GET    /friends/stats/:id        - Get user stats
GET    /friends/my-stats         - Get current user's stats
```

## Type Definitions

```typescript
interface FollowStats {
  followersCount: number;
  followingCount: number;
}

interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

interface FollowRequest {
  friendId: string;
}
```

## Best Practices

1. **Use FollowButton for simple cases** - It handles all the complexity
2. **Use hooks for custom UI** - When you need specific behavior
3. **Handle loading states** - Always show loading indicators
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Use optimistic updates** - For better user experience

## Example Integration

```tsx
import React from "react";
import { FollowButton, useUserStats, useFollowers } from "@/components";

export const UserProfile = ({ user, isOwnProfile }) => {
  const { data: stats } = useUserStats(user.id);
  const { data: followers } = useFollowers(user.id);

  return (
    <div className="user-profile">
      <div className="user-info">
        <h2>{user.fullName}</h2>
        <p>@{user.userName}</p>

        {/* Stats */}
        <div className="stats">
          <span>{stats?.data.followersCount} followers</span>
          <span>{stats?.data.followingCount} following</span>
        </div>

        {/* Follow button */}
        {!isOwnProfile && <FollowButton targetUserId={user.id} />}
      </div>

      {/* Followers list */}
      <div className="followers">
        {followers?.data.map((follower) => (
          <div key={follower.id}>
            {follower.fullName}
            <FollowButton targetUserId={follower.id} variant="outline" />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors** - Make sure all exports are added to `index.ts` files
2. **401 Unauthorized** - Check if user is logged in and tokens are valid
3. **Loading never ends** - Check network tab for failed requests
4. **Stale data** - React Query should handle this, but you can manually invalidate queries

### Debug Mode

Enable debug logging in development:

```typescript
// In your main app file
if (process.env.NODE_ENV === "development") {
  console.log("Follow service debug mode enabled");
}
```

The service already logs requests and responses in development mode via the Axios interceptors.
