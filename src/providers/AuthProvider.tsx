"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
import { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if current page is auth page
  const isAuthPage = [
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].some((path) => pathname.startsWith(path));

  /**
   * Fetch user data từ server và update Redux state
   * Chỉ quản lý state, KHÔNG redirect
   */
  const fetchUserData = useCallback(async () => {
    try {
      setError(null);

      const response = await authService.getCurrentUser();

      if (response?.data) {
        dispatch(
          loginSuccess({
            user: response.data,
            token: "http-only-cookie",
          })
        );
      } else {
        dispatch(logout());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      setError(errorMessage);

      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        dispatch(logout());
      }
    }
  }, [dispatch]);


  const initializeAuth = useCallback(async () => {
    if (hasInitialized.current) return;

    // Trên auth pages, chỉ set loading = false, không fetch user
    if (isAuthPage) {
      setIsLoading(false);
      hasInitialized.current = true;
      return;
    }

    setIsLoading(true);
    await fetchUserData();
    setIsLoading(false);
    hasInitialized.current = true;
  }, [fetchUserData, isAuthPage]);

  /**
   * Public method để manually refetch user data
   */
  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUserData();
    setIsLoading(false);
  }, [fetchUserData]);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Cross-tab synchronization
   * Listen for auth events từ other tabs
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth-sync") {
        // Another tab has updated auth state, sync here
        refetchUser();
      }
    };

    const handleAuthSyncEvent = (event: CustomEvent) => {
      if (event.detail?.action === "logout") {
        dispatch(logout());
      } else if (event.detail?.action === "login") {
        refetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-sync", handleAuthSyncEvent as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "auth-sync",
        handleAuthSyncEvent as EventListener
      );
    };
  }, [dispatch, refetchUser]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    refetchUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
