import { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/hooks";
import {
  useLegacyUser as useUser,
  type User,
  type TabType,
} from "@/features/profile";

interface UseProfilePageProps {
  profileId: string;
}

interface UseProfilePageReturn {
  profileUser: User | null;
  activeTab: TabType;
  loading: boolean;
  error: string | null;
  isOwnProfile: boolean;
  isLoadingUser: boolean;
  handleTabChange: (tab: TabType) => void;
  refetchProfile: () => void;
}

export const useProfilePage = ({
  profileId,
}: UseProfilePageProps): UseProfilePageReturn => {
  const userRedux: User | null = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is user's own profile
  const isOwnProfile = profileId === "me";

  // Only fetch user data if not own profile
  const queryId = isOwnProfile ? "" : profileId;
  const { user, userError, refreshUserProfile, isLoadingUser } = useUser({
    userId: queryId,
  });

  // Derived profile user based on whether it's own profile or not
  const profileUser = useMemo(() => {
    if (isOwnProfile && userRedux) {
      return userRedux;
    } else if (!isOwnProfile && user) {
      return user as User;
    }
    return null;
  }, [isOwnProfile, userRedux, user]);

  // Handle tab change with loading simulation
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLoading(true);
    setError(null);

    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Handle errors
  useEffect(() => {
    if (userError) {
      setError(userError.message || "Failed to load profile");
    }
  }, [userError]);

  // Reset error when profile changes
  useEffect(() => {
    setError(null);
  }, [profileId]);

  return {
    profileUser,
    activeTab,
    loading,
    error,
    isOwnProfile,
    isLoadingUser,
    handleTabChange,
    refetchProfile: refreshUserProfile,
  };
};
