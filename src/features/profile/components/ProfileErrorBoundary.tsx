import React from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProfileErrorState } from "@/features/profile";

interface ProfileErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export const ProfileErrorBoundary: React.FC<ProfileErrorBoundaryProps> = ({
  children,
  onRetry,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <ProfileErrorState
          error="Something went wrong while loading the profile"
          onRetry={onRetry}
          type="generic"
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ProfileErrorBoundary;
