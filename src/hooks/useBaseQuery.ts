import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { PaginatedResponse, PaginationParams } from "@/types/common";

/**
 * Base Query Hook - Cung cấp pattern chuẩn cho TanStack Query v5
 * Tất cả hooks khác nên extend từ đây để đảm bảo consistency
 */

// Base query options với placeholderData thay vì keepPreviousData (v5)
export function useBaseQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Base search query với placeholderData
export function useBaseSearchQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey,
    queryFn,
    placeholderData: (previousData) => previousData, // Thay thế keepPreviousData
    ...options,
  });
}

// Base mutation với invalidation pattern chuẩn
export function useBaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKeysToInvalidate: string[][],
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate tất cả query keys liên quan
      queryKeysToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}

// Helper để tạo CRUD hooks chuẩn
export function createCrudHooks<T, CreateData, UpdateData>(
  entityName: string,
  api: {
    getAll: () => Promise<T[]>;
    getPaginated: (
      pageNumber?: number,
      pageSize?: number,
      params?: any,
    ) => Promise<PaginatedResponse<T>>;
    search: (
      query: string,
      pageNumber?: number,
      pageSize?: number,
      params?: any,
    ) => Promise<PaginatedResponse<T>>;
    create: (data: CreateData) => Promise<T>;
    update: (id: string, data: UpdateData) => Promise<T>;
    delete: (id: string) => Promise<number | void>;
  },
) {
  return {
    // List hook
    useList: (params?: PaginationParams) => {
      return useBaseQuery([entityName, params], () =>
        api.getPaginated(params?.pageNumber, params?.pageSize, params),
      );
    },

    // All items hook
    useAll: () => {
      return useBaseQuery([entityName, "all"], () => api.getAll());
    },

    // Search hook
    useSearch: (keyword?: string | null, pageNumber = 1, pageSize = 10) => {
      return useBaseSearchQuery(
        [entityName, "search", keyword, pageNumber, pageSize],
        () => api.search(keyword ?? "", pageNumber, pageSize),
      );
    },

    // Create mutation
    useCreate: () => {
      return useBaseMutation(
        (data: CreateData) => api.create(data),
        [[entityName]],
      );
    },

    // Update mutation
    useUpdate: () => {
      return useBaseMutation(
        ({ id, data }: { id: string; data: UpdateData }) =>
          api.update(id, data),
        [[entityName]],
      );
    },

    // Delete mutation
    useDelete: () => {
      return useBaseMutation((id: string) => api.delete(id), [[entityName]], {
        onSuccess: (result) => {
          // Chỉ invalidate nếu thực sự có record bị xóa
          if (typeof result === "number" && result === 0) {
            console.warn(`No ${entityName} was deleted`);
          }
        },
      });
    },
  };
}
