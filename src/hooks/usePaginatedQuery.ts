import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { usePaginatedData } from "./usePagination";
import type { PaginatedResponse } from "@/types/common";

export interface UsePaginatedQueryOptions<T> {
  queryKey: (string | number)[];
  queryFn: (
    page: number,
    pageSize: number,
    filters?: Record<string, any>,
  ) => Promise<PaginatedResponse<T>>;
  initialPageSize?: number;
  filters?: Record<string, any>;
  queryOptions?: Omit<
    UseQueryOptions<PaginatedResponse<T>>,
    "queryKey" | "queryFn"
  >;
}

/**
 * Custom hook for paginated queries with consistent pagination handling
 *
 * @param options Configuration options for the paginated query
 * @returns Object containing pagination state, data, and query state
 */
export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  initialPageSize = 100,
  filters = {},
  queryOptions = {},
}: UsePaginatedQueryOptions<T>) {
  // Initialize pagination
  const pagination = usePaginatedData<T>({
    initialPageSize,
  });

  // Build query key with pagination and filters
  const fullQueryKey = [
    ...queryKey,
    pagination.currentPage,
    pagination.pageSize,
    ...Object.values(filters).filter(
      (v) => v !== undefined && v !== null && v !== "",
    ),
  ];

  // Execute query
  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: () =>
      queryFn(pagination.currentPage, pagination.pageSize, filters),
    ...queryOptions,
  });

  // Update pagination data when response changes
  const paginatedData = usePaginatedData({
    data: query.data,
    initialPageSize,
  });

  return {
    // Pagination controls
    ...paginatedData,

    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,

    // Raw query data
    data: query.data,
  };
}

/**
 * Hook for list queries (standard page size for tables, etc.)
 * Uses pageSize of 10 as specified in requirements
 */
export function useListQuery<T>({
  queryKey,
  queryFn,
  filters = {},
  queryOptions = {},
}: Omit<UsePaginatedQueryOptions<T>, "initialPageSize">) {
  return usePaginatedQuery({
    queryKey,
    queryFn,
    initialPageSize: 10,
    filters,
    queryOptions,
  });
}
