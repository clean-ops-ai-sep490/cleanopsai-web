import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { Zone, ZoneFormData } from "@/types/contract";
import type { PaginatedRequest } from "@/types/common";

// Legacy interfaces for backward compatibility
export interface ZonesPaginatedResponse {
  items: Zone[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ZonesPaginatedRequest extends PaginatedRequest {
  locationId?: string;
}

// Create CRUD API using factory with consistent endpoint casing
const zoneApi = createSearchableApi<Zone, ZoneFormData, ZoneFormData>("/Zones");

// Export individual functions for backward compatibility
export const {
  create: createZone,
  getById: getZoneById,
  update: updateZone,
  delete: deleteZone,
  getAll: getZones,
  getPaginated: getZonesPaginatedNew,
  search: searchZones,
} = zoneApi;

// Legacy function for backward compatibility with location-specific endpoint
export async function getZonesPaginated(
  params: ZonesPaginatedRequest = {},
): Promise<ZonesPaginatedResponse> {
  const { pageNumber = 1, pageSize = 10, search, locationId, ...rest } = params;

  try {
    let response;

    // Use specific endpoint for location-based filtering
    if (locationId) {
      const queryParams = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      response = await api.get<any>(
        `/Zones/location/${locationId}?${queryParams.toString()}`,
      );

      // Parse response using centralized parser
      const items = parseArrayResponse<Zone>(response);

      return {
        items,
        totalCount: items.length,
        pageNumber,
        pageSize,
      };
    } else {
      // Use standard CRUD API
      const paginatedResponse = await zoneApi.getPaginated(
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
        pageNumber: paginatedResponse.pageNumber,
        pageSize: paginatedResponse.pageSize,
      };
    }
  } catch (error) {
    console.error("Failed to load zones:", error);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
  }
}
