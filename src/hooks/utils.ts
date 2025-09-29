// Simple query key factory
export const createQueryKeys = (domain: string) => ({
  all: [domain] as const,
  lists: () => [domain, "list"] as const,
  list: (filters: any) => [domain, "list", filters] as const,
  details: () => [domain, "detail"] as const,
  detail: (id: string) => [domain, "detail", id] as const,
});

// Simple base query options
export const createBaseQueryOptions = (domain: string) => ({
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 1,
});

// Simple error handler
export const useErrorHandler = () => ({
  handleError: (error: any, context?: string) => {
    console.error(context || "Error:", error);
  },
  handleSuccess: (message: string) => {
    console.log("Success:", message);
  },
});
