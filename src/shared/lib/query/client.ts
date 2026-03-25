import { QueryClient } from "@tanstack/react-query";

/**
 * React Query client configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: import.meta.env.PROD,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Common query keys for the application
 */
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (filters: string) => [...queryKeys.contacts.lists(), { filters }] as const,
    details: () => [...queryKeys.contacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },
} as const;
