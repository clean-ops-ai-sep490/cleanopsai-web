import { useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types/common";

export interface UseInfiniteSelectOptions<T> {
  queryKey: (string | number)[];
  queryFn: (
    page: number,
    pageSize: number,
    searchQuery?: string,
    filters?: Record<string, any>,
  ) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  searchQuery?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  searchDebounceMs?: number;
}

export interface UseInfiniteSelectReturn<T> {
  // Data
  items: T[];
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: any;

  // Actions
  fetchNextPage: () => void;
  refetch: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearchQuery: string;

  // Scroll handling
  scrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Hook for infinite scroll select components
 * Automatically loads more data when user scrolls to bottom
 */
export function useInfiniteSelect<T>({
  queryKey,
  queryFn,
  pageSize = 20,
  searchQuery: externalSearchQuery,
  filters = {},
  enabled = true,
  searchDebounceMs = 300,
}: UseInfiniteSelectOptions<T>): UseInfiniteSelectReturn<T> {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use external search query if provided, otherwise use internal
  const searchQuery = externalSearchQuery ?? internalSearchQuery;

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, searchDebounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, searchDebounceMs]);

  // Build query key with debounced search and filters
  const fullQueryKey = [
    ...queryKey,
    debouncedSearchQuery,
    ...Object.values(filters).filter(
      (v) => v !== undefined && v !== null && v !== "",
    ),
  ];

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: fullQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      queryFn(pageParam, pageSize, debouncedSearchQuery, filters),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  // Flatten all pages into single array and ensure uniqueness
  const allItems = data?.pages.flatMap((page) => page.content) ?? [];
  const items = Array.from(
    new Map(allItems.map((item: any) => [item.id || item.value, item])).values(),
  ) as T[];

  // Handle scroll to load more
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when user scrolls to 80% of the content
      if (
        scrollPercentage > 0.8 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage],
  );

  const setSearchQueryWrapper = useCallback(
    (query: string) => {
      if (externalSearchQuery === undefined) {
        setInternalSearchQuery(query);
      }
    },
    [externalSearchQuery],
  );

  return {
    items,
    hasNextPage: hasNextPage ?? false,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    fetchNextPage,
    refetch,
    searchQuery,
    setSearchQuery: setSearchQueryWrapper,
    debouncedSearchQuery,
    scrollRef,
    handleScroll,
  };
}

/**
 * Hook for infinite scroll with search functionality
 * Optimized for select components with search
 */
export function useInfiniteSelectWithSearch<T>(
  options: Omit<UseInfiniteSelectOptions<T>, "searchQuery">,
) {
  return useInfiniteSelect<T>(options);
}
