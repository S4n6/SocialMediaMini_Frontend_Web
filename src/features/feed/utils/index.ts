import { useCallback } from "react";

// Temporary error handler utility for feed features
export interface ErrorContext {
  component?: string;
  userId?: string;
  postId?: string;
  // Add other context fields as needed
}

export const useErrorHandler = (context: string | Partial<ErrorContext>) => {
  const handleError = useCallback(
    (error: unknown, additionalContext?: Partial<ErrorContext>) => {
      console.error("Error in", context, error, additionalContext);
      // TODO: Implement proper error handling, logging, and user notification
    },
    [context]
  );

  return { handleError };
};

export const createQueryKeys = (baseKey: string) => ({
  all: [baseKey],
  lists: () => [...createQueryKeys(baseKey).all, "list"],
  list: (filters: any) => [...createQueryKeys(baseKey).lists(), { filters }],
  details: () => [...createQueryKeys(baseKey).all, "detail"],
  detail: (id: string) => [...createQueryKeys(baseKey).details(), id],
});
