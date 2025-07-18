"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import type { RootState } from "@/store";

/**
 * Higher-order component to protect routes
 * Redirects unauthenticated users to login page
 */
export function withAuth<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
) {
  return function ProtectedRoute(props: T) {
    const router = useRouter();
    const isAuthenticated = useAppSelector(
      (state: RootState) => state.auth.isAuthenticated
    );

    useEffect(() => {
      // Check authentication status on mount and route changes
      if (!isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, router]);

    // Don't render component if not authenticated
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Checking authentication...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to check authentication status
 * Can be used in any component to get current auth state
 */
export function useAuth() {
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);

  return {
    isAuthenticated,
    user,
    token,
  };
}
