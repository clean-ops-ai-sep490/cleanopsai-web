import { api } from "./api";
import type { Zone, ZoneFormData } from "@/types/contract";

export interface ZonesPaginatedResponse {
  items: Zone[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ZonesPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  locationId?: string;
}

export async function getZonesPaginated(
  params: ZonesPaginatedRequest = {},
): Promise<ZonesPaginatedResponse> {
  const { pageNumber = 1, pageSize = 50, search, locationId } = params;

  let url = "/Zones";
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  // Use specific endpoint for location-based filtering
  if (locationId) {
    url = `/Zones/location/${locationId}`;
  }

  if (search) {
    queryParams.append("search", search);
  }

  try {
    const response = await api.get<any>(`${url}?${queryParams.toString()}`);

    console.log("Raw Zones API response:", response);

    // Handle different response formats - prioritize 'content' for consistency
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

    console.log("Unexpected Zones API response structure:", response);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
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

export async function createZone(data: ZoneFormData): Promise<Zone> {
  return api.post<Zone>("/Zones", data);
}

export async function getZones(): Promise<Zone[]> {
  const response = await api.get<Zone[] | { data: Zone[] } | any>("/Zones");

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

  console.log("Unexpected Zones API response structure:", response);
  return [];
}

export async function getZoneById(id: string): Promise<Zone> {
  return api.get<Zone>(`/Zones/${id}`);
}

export async function updateZone(
  id: string,
  data: ZoneFormData,
): Promise<Zone> {
  return api.put<Zone>(`/Zones/${id}`, data);
}

export async function deleteZone(id: string): Promise<void> {
  return api.delete(`/Zones/${id}`);
}
