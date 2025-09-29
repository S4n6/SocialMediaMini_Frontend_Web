import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { createQueryKeys, createBaseQueryOptions } from "../utils";
import { useAppSelector } from "@/hooks/redux";

// Create query keys for auth domain
const authKeys = createQueryKeys("auth");

/**
 * Auth queries hook - handles all read operations
 */
export const useAuthQueries = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const baseOptions = createBaseQueryOptions("auth");

  /**
   * Get current user query
   */
  const currentUserQuery = useQuery({
    queryKey: authKeys.detail("current"),
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
