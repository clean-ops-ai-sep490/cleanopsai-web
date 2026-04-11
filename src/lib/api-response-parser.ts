/**
 * Utility functions for parsing API responses consistently across the application
 */

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Parse array response from various API response formats
 * Handles different response structures: direct array, { content: [] }, { data: [] }, { items: [] }
 */
export function parseArrayResponse<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response?.content && Array.isArray(response.content)) {
    return response.content;
  }
  
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  if (response?.items && Array.isArray(response.items)) {
    return response.items;
  }
  
  console.warn("Unexpected API response structure:", response);
  return [];
}

/**
 * Parse paginated response with fallback values
 */
export function parsePaginatedResponse<T>(
  response: any,
  pageNumber: number = 1,
  pageSize: number = 10
): PaginatedResponse<T> {
  // If response already has pagination structure
  if (response?.content && Array.isArray(response.content)) {
    return {
      content: response.content,
      pageNumber: response.pageNumber ?? pageNumber,
      pageSize: response.pageSize ?? pageSize,
      totalElements: response.totalElements ?? response.content.length,
      totalPages: response.totalPages ?? Math.ceil((response.totalElements ?? response.content.length) / pageSize),
      hasPreviousPage: response.hasPreviousPage ?? pageNumber > 1,
      hasNextPage: response.hasNextPage ?? false,
    };
  }
  
  // If response is direct array, create pagination structure
  const items = parseArrayResponse<T>(response);
  return {
    content: items,
    pageNumber,
    pageSize,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / pageSize),
    hasPreviousPage: pageNumber > 1,
    hasNextPage: false,
  };
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context: string): void {
  console.error(`Failed to ${context}:`, error);
}

/**
 * Build query parameters from object
 */
export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams;
}