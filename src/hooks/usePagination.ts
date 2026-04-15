import { useState, useCallback, useMemo } from "react";
import { PaginatedResponse, PaginationParams } from "@/types/common";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

export interface UsePaginationReturn {
  // Current pagination state
  currentPage: number;
  pageSize: number;

  // Pagination controls
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;

  // Query parameters for API calls
  paginationParams: PaginationParams;

  // Reset pagination
  reset: () => void;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const { initialPage = 1, initialPageSize = 10, onPageChange } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setCurrentPageSize] = useState(initialPageSize);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      onPageChange?.(page, pageSize);
    },
    [pageSize, onPageChange],
  );

  const setPageSize = useCallback(
    (size: number) => {
      setCurrentPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
      onPageChange?.(1, size);
    },
    [onPageChange],
  );

  const nextPage = useCallback(() => {
    setPage(currentPage + 1);
  }, [currentPage, setPage]);

  const prevPage = useCallback(() => {
    setPage(Math.max(1, currentPage - 1));
  }, [currentPage, setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(
    (totalPages: number) => {
      setPage(totalPages);
    },
    [setPage],
  );

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setCurrentPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const paginationParams = useMemo(
    (): PaginationParams => ({
      pageNumber: currentPage,
      pageSize,
    }),
    [currentPage, pageSize],
  );

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    paginationParams,
    reset,
  };
}

// Hook for handling paginated API responses
export interface UsePaginatedDataOptions<T> extends UsePaginationOptions {
  data?: PaginatedResponse<T>;
}

export interface UsePaginatedDataReturn<T> extends UsePaginationReturn {
  // Data from API response
  items: T[];
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  // Computed values
  isEmpty: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  startItem: number;
  endItem: number;
}

export function usePaginatedData<T>(
  options: UsePaginatedDataOptions<T> = {},
): UsePaginatedDataReturn<T> {
  const { data, ...paginationOptions } = options;
  const pagination = usePagination(paginationOptions);

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasPreviousPage = data?.hasPreviousPage ?? false;
  const hasNextPage = data?.hasNextPage ?? false;

  const isEmpty = items.length === 0;
  const isFirstPage = pagination.currentPage === 1;
  const isLastPage = pagination.currentPage === totalPages;

  const startItem =
    totalElements > 0
      ? (pagination.currentPage - 1) * pagination.pageSize + 1
      : 0;
  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    totalElements,
  );

  return {
    ...pagination,
    items,
    totalElements,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    isEmpty,
    isFirstPage,
    isLastPage,
    startItem,
    endItem,
  };
}
