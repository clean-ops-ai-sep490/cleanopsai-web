import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { WorkArea, WorkAreaFormData } from "@/types/contract";
import type { PaginatedRequest } from "@/types/common";

export interface WorkAreasPaginatedRequest extends PaginatedRequest {
  zoneId?: string;
}

// Create CRUD API using factory with consistent endpoint casing
const workAreaApi = createSearchableApi<
  WorkArea,
  WorkAreaFormData,
  WorkAreaFormData
>("/WorkAreas");

// Export individual functions for backward compatibility
export const {
  create: createWorkArea,
  getById: getWorkAreaById,
  update: updateWorkArea,
  delete: deleteWorkArea,
  getAll: getWorkAreas,
  getPaginated: getWorkAreasPaginatedNew,
  search: searchWorkAreas,
} = workAreaApi;

// Legacy function for backward compatibility with zone-specific endpoint
export async function getWorkAreasPaginated(
  params: WorkAreasPaginatedRequest = {},
): Promise<{ items: WorkArea[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10, search, zoneId, ...rest } = params;

  try {
    let response;

    // Use specific endpoint for zone-based filtering
    if (zoneId) {
      const queryParams = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      response = await api.get<any>(
        `/WorkAreas/zone/${zoneId}?${queryParams.toString()}`,
      );

      // Parse response using centralized parser
      const items = parseArrayResponse<WorkArea>(response);

      return {
        items,
        totalCount: items.length,
      };
    } else {
      // Use standard CRUD API
      const paginatedResponse = await workAreaApi.getPaginated(
        pageNumber,
        pageSize,
        {
          search,
          ...rest,
        },
      );

      return {
        items: paginatedResponse.content,
        totalCount: paginatedResponse.totalElements,
      };
    }
  } catch (error) {
    console.error("Failed to load work areas:", error);
    return { items: [], totalCount: 0 };
  }
}
