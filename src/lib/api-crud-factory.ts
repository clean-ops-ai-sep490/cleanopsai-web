import { api } from "./api";
import {
  parseArrayResponse,
  parsePaginatedResponse,
  type PaginatedResponse,
} from "./api-response-parser";

/**
 * Generic CRUD API factory to eliminate duplicate CRUD operations
 */
export function createCrudApi<T, CreateData, UpdateData = Partial<CreateData>>(
  endpoint: string,
) {
  return {
    /**
     * Create a new entity
     */
    create: async (data: CreateData): Promise<T> => {
      return api.post<T>(endpoint, data);
    },

    /**
     * Get entity by ID
     */
    getById: async (id: string): Promise<T> => {
      return api.get<T>(`${endpoint}/${id}`);
    },

    /**
     * Update entity by ID
     */
    update: async (id: string, data: UpdateData): Promise<T> => {
      return api.put<T>(`${endpoint}/${id}`, data);
    },

    /**
     * Delete entity by ID
     */
    delete: async (id: string): Promise<void> => {
      return api.delete(`${endpoint}/${id}`);
    },

    /**
     * Get all entities (with response parsing)
     */
    getAll: async (): Promise<T[]> => {
      const response = await api.get<
        T[] | { data: T[] } | { content: T[] } | any
      >(endpoint);
      return parseArrayResponse<T>(response);
    },

    /**
     * Get paginated entities
     */
    getPaginated: async (
      pageNumber: number = 1,
      pageSize: number = 10,
      additionalParams: Record<string, any> = {},
    ): Promise<PaginatedResponse<T>> => {
      const params = {
        pageNumber,
        pageSize,
        ...additionalParams,
      };

      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          (typeof value === "string" ? value !== "" : value !== 0)
        ) {
          queryString.append(key, String(value));
        }
      });

      const response = await api.get<any>(
        `${endpoint}?${queryString.toString()}`,
      );
      return parsePaginatedResponse<T>(response, pageNumber, pageSize);
    },
  };
}

/**
 * Create API with search functionality
 */
export function createSearchableApi<
  T,
  CreateData,
  UpdateData = Partial<CreateData>,
>(endpoint: string) {
  const baseApi = createCrudApi<T, CreateData, UpdateData>(endpoint);

  return {
    ...baseApi,

    /**
     * Search entities with query
     */
    search: async (
      query: string,
      pageNumber: number = 1,
      pageSize: number = 10,
      additionalParams: Record<string, any> = {},
    ): Promise<PaginatedResponse<T>> => {
      return baseApi.getPaginated(pageNumber, pageSize, {
        search: query,
        ...additionalParams,
      });
    },
  };
}
