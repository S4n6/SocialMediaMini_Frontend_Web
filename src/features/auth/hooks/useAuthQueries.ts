import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { createQueryKeys, createBaseQueryOptions } from '../utils';
import { useAppSelector } from '@/hooks/redux';

// Create query keys for auth domain
const authKeys = createQueryKeys.auth;

/**
 * Auth queries hook - handles all read operations
 */
export const useAuthQueries = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const baseOptions = createBaseQueryOptions;

  /**
   * Get current user query
   */
  const currentUserQuery = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    ...baseOptions,
    select: (response) => response.data,
  });

  return {
    currentUser: currentUserQuery,
    // Add more queries as needed
  };
};

/**
 * Hook for email validation
 */
export const useEmailCheck = (email: string) => {
  return useQuery({
    queryKey: ['auth', 'email-exists', email],
    queryFn: () => authService.checkEmailExists(email),
    select: (res: any) => (res && res.data ? res.data : null),
    enabled: !!email && email.includes('@'),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook for username validation
 */
export const useUsernameCheck = (userName: string) => {
  return useQuery({
    queryKey: ['auth', 'username-exists', userName],
    queryFn: () => authService.checkUsernameExists(userName),
    select: (res: any) => (res && res.data ? res.data : null),
    enabled: !!userName && userName.length > 2,
    staleTime: 30000, // 30 seconds
  });
};
