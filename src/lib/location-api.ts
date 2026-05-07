import { createSearchableApi } from "./api-crud-factory";
import { api } from "./api";
import type { Location, LocationFormData } from "@/types/contract";
import type { PaginatedRequest } from "@/types/common";

// Legacy interfaces for backward compatibility
export interface LocationsPaginatedResponse {
  items: Location[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface LocationsPaginatedRequest extends PaginatedRequest {
  clientId?: string;
}

// Create CRUD API using factory
const locationApi = createSearchableApi<
  Location,
  LocationFormData,
  LocationFormData
>("/Locations");

// Export individual functions for backward compatibility
export const {
  create: createLocation,
  getById: getLocationById,
  update: updateLocation,
  delete: deleteLocation,
  getAll: getLocations,
  getPaginated: getLocationsPaginatedNew,
  search: searchLocations,
} = locationApi;

// Legacy function for backward compatibility
export async function getLocationsPaginated(
  params: LocationsPaginatedRequest = {},
): Promise<LocationsPaginatedResponse> {
  const { pageNumber = 1, pageSize = 10, search, clientId, ...rest } = params;

  try {
    const response = await locationApi.getPaginated(pageNumber, pageSize, {
      search,
      clientId,
      ...rest,
    });

    return {
      items: response.content,
      totalCount: response.totalElements,
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
    };
  } catch (error) {
    console.error("Failed to load locations:", error);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
  }
}

// Function to get locations by clientId using the correct endpoint
export async function getLocationsByClientId(
  clientId: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<LocationsPaginatedResponse> {
  const { pageNumber = 1, pageSize = 10 } = params;

  try {
    const queryString = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await api.get<any>(
      `/Locations/client/${clientId}?${queryString.toString()}`,
    );

    return {
      items: response.content || [],
      totalCount: response.totalElements || 0,
      pageNumber: response.pageNumber || pageNumber,
      pageSize: response.pageSize || pageSize,
    };
  } catch (error) {
    console.error("Failed to load locations by clientId:", error);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
  }
}
