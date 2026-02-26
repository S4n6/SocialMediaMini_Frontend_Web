import {
  ApiResponse,
  ApiError,
  UnifiedResponse,
  PaginatedResponse,
} from '@/types/api';

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(
  response: UnifiedResponse<T>,
): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: UnifiedResponse): response is ApiError {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false
  );
}

/**
 * Extract data from API response safely
 */
export function extractApiData<T>(response: UnifiedResponse<T>): T | null {
  if (isApiSuccess(response)) {
    return response.data ?? null;
  }
  return null;
}

/**
 * Extract error message from API response
 */
export function extractApiError(response: UnifiedResponse): string {
  if (isApiError(response)) {
    return response.message || 'An error occurred';
  }
  return 'Unknown error';
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message = 'Success',
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: string,
  field?: string,
): ApiError {
  return {
    success: false,
    message,
    code: code || 'GENERIC_ERROR',
    details,
  };
}

/**
 * Transform paginated response for consistent pagination
 */
export function transformPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Data retrieved successfully',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Handle API response errors and extract meaningful messages
 */
export function handleApiResponseError(error: any): string {
  // Axios error
  if (error?.response?.data) {
    const responseData = error.response.data;

    // Standardized API error
    if (isApiError(responseData)) {
      return extractApiError(responseData);
    }

    // Legacy error formats
    if (responseData.message) {
      return responseData.message;
    }

    if (responseData.error) {
      return typeof responseData.error === 'string'
        ? responseData.error
        : responseData.error.message || 'Server error';
    }
  }

  // Network or other errors
  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any): boolean {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string'
  );
}

/**
 * Handle pagination parameters
 */
export function buildPaginationParams(page: number, limit: number = 10) {
  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), 100), // Max 100 items per page
    offset: (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), 100),
  };
}

/**
 * Format API URL with parameters
 */
export function buildApiUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, any>,
): string {
  let url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}
