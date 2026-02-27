import { ApiResponse, PaginatedResponse } from '@/types';

// ───────────────────────────────────────────────────────────
// Shared helpers for stub API services
// ───────────────────────────────────────────────────────────

const IS_DEV = process.env.NODE_ENV === 'development';

/** Log a one-time warning per endpoint that it is still stubbed. */
const warned = new Set<string>();
function warnStub(label: string) {
  if (IS_DEV && !warned.has(label)) {
    warned.add(label);
    console.warn(
      `[apiService] ${label} is not implemented – returning stub response`,
    );
  }
}

export function ok<T>(data: T, label: string): ApiResponse<T> {
  warnStub(label);
  return { success: true, data };
}

export function emptyPage<T>(label: string): PaginatedResponse<T> {
  warnStub(label);
  return {
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}
