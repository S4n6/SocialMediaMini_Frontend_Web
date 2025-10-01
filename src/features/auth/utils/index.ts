import { useErrorHandler as useGlobalErrorHandler } from "@/hooks/useErrorHandler";

// Auth-specific error handler
export const useErrorHandler = () => {
  const { handleError: globalHandleError } = useGlobalErrorHandler({
    component: "AuthFeature",
  });

  return {
    handleError: globalHandleError,
  };
};

// Query key utilities
export const createQueryKeys = {
  auth: {
    all: () => ["auth"] as const,
    currentUser: () => ["auth", "currentUser"] as const,
    verifyEmail: (token: string) => ["auth", "verifyEmail", token] as const,
  },
};

// Base query options
export const createBaseQueryOptions = {
  retry: 3,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
};
