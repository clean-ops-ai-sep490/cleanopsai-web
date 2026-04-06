import { api } from "./api";
import type { Location, LocationFormData } from "@/types/contract";

export interface LocationsPaginatedResponse {
  items: Location[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface LocationsPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  clientId?: string;
}

export async function getLocationsPaginated(
  params: LocationsPaginatedRequest = {},
): Promise<LocationsPaginatedResponse> {
  const { pageNumber = 1, pageSize = 50, search, clientId } = params;

  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  if (clientId) {
    queryParams.append("clientId", clientId);
  }

  try {
    const response = await api.get<any>(`/Locations?${queryParams.toString()}`);

    console.log("Raw Locations API response:", response);

    // Handle different response formats - prioritize 'content' for this API
    if (response && Array.isArray(response.content)) {
      console.log("Found content array:", response.content);
      return {
        items: response.content,
        totalCount: response.totalElements || response.content.length,
        pageNumber: response.pageNumber || pageNumber,
        pageSize: response.pageSize || pageSize,
      };
    }

    if (response && Array.isArray(response.items)) {
      console.log("Found items array:", response.items);
      return {
        items: response.items,
        totalCount: response.totalCount || response.items.length,
        pageNumber: response.pageNumber || pageNumber,
        pageSize: response.pageSize || pageSize,
      };
    }

    if (Array.isArray(response)) {
      console.log("Response is direct array:", response);
      return {
        items: response,
        totalCount: response.length,
        pageNumber,
        pageSize,
      };
    }

    if (response && Array.isArray(response.data)) {
      console.log("Found data array:", response.data);
      return {
        items: response.data,
        totalCount: response.data.length,
        pageNumber,
        pageSize,
      };
    }

    console.log("Unexpected Locations API response structure:", response);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
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

export async function createLocation(
  data: LocationFormData,
): Promise<Location> {
  return api.post<Location>("/Locations", data);
}

export async function getLocations(): Promise<Location[]> {
  const response = await api.get<Location[] | { data: Location[] } | any>(
    "/Locations",
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.content)) {
    return response.content;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  console.log("Unexpected Locations API response structure:", response);
  return [];
}

export async function getLocationById(id: string): Promise<Location> {
  return api.get<Location>(`/Locations/${id}`);
}

export async function updateLocation(
  id: string,
  data: LocationFormData,
): Promise<Location> {
  return api.put<Location>(`/Locations/${id}`, data);
}

export async function deleteLocation(id: string): Promise<void> {
  return api.delete(`/Locations/${id}`);
}
