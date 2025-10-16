'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { loginSuccess, logout } from '@/store/slices/authSlice';
import { authService } from '@/services/api.service';
import { User } from '@/types/user';

// Auth state types
interface AuthState {
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

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
    throw new Error('useAuthContext must be used within an AuthProvider');
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

  const [state, authDispatch] = useReducer(authReducer, {
    isLoading: true,
    error: null,
  });
  const hasInitialized = useRef(false);

  const clearError = useCallback(() => {
    authDispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check if current page is auth page
  const isAuthPage = [
    '/login',
    '/signup',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].some((path) => pathname.startsWith(path));

  /**
   * Fetch user data from the server and update Redux state
   * Only manage state here; DO NOT perform redirects
   */
  const fetchUserData = useCallback(async () => {
    try {
      authDispatch({ type: 'SET_ERROR', payload: null });

      const response = await authService.getCurrentUser();

      if (response?.data) {
        dispatch(
          loginSuccess({
            user: response.data,
            token: 'http-only-cookie',
          }),
        );
      } else {
        dispatch(logout());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';
      authDispatch({ type: 'SET_ERROR', payload: errorMessage });

      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        dispatch(logout());
      }
    }
  }, [dispatch]);

  const initializeAuth = useCallback(async () => {
    if (hasInitialized.current) return;

    // On auth pages, only set loading = false and do not fetch user
    if (isAuthPage) {
      authDispatch({ type: 'SET_LOADING', payload: false });
      hasInitialized.current = true;
      return;
    }

    authDispatch({ type: 'SET_LOADING', payload: true });
    await fetchUserData();
    authDispatch({ type: 'SET_LOADING', payload: false });
    hasInitialized.current = true;
  }, [fetchUserData, isAuthPage]);

  /**
   * Public method để manually refetch user data
   */
  const refetchUser = useCallback(async () => {
    authDispatch({ type: 'SET_LOADING', payload: true });
    await fetchUserData();
    authDispatch({ type: 'SET_LOADING', payload: false });
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
      if (event.key === 'auth-sync') {
        // Another tab has updated auth state, sync here
        refetchUser();
      }
    };

    const handleAuthSyncEvent = (event: CustomEvent) => {
      if (event.detail?.action === 'logout') {
        dispatch(logout());
      } else if (event.detail?.action === 'login') {
        refetchUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-sync', handleAuthSyncEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'auth-sync',
        handleAuthSyncEvent as EventListener,
      );
    };
  }, [dispatch, refetchUser]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    refetchUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
