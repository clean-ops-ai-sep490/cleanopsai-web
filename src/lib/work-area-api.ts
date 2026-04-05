import { api } from "./api";
import type { WorkArea, WorkAreaFormData } from "@/types/contract";

export interface WorkAreasPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  zoneId?: string;
}

export async function createWorkArea(
  data: WorkAreaFormData,
): Promise<WorkArea> {
  return api.post<WorkArea>("/WorkAreas", data);
}

export async function getWorkAreas(): Promise<WorkArea[]> {
  const response = await api.get<WorkArea[] | { data: WorkArea[] } | any>(
    "/WorkAreas",
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

  console.log("Unexpected WorkAreas API response structure:", response);
  return [];
}

export async function getWorkAreasPaginated(
  params: WorkAreasPaginatedRequest = {},
): Promise<{ items: WorkArea[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 50, search, zoneId } = params;

  let url = "/WorkAreas";
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  // Use specific endpoint for zone-based filtering
  if (zoneId) {
    url = `/WorkAreas/zone/${zoneId}`;
  }

  if (search) {
    queryParams.append("search", search);
  }

  try {
    const response = await api.get<any>(`${url}?${queryParams.toString()}`);

    console.log("WorkAreas Paginated API Response:", response);

    if (response && Array.isArray(response.content)) {
      return {
        items: response.content,
        totalCount: response.totalElements || response.content.length,
      };
    }

    if (response && Array.isArray(response.items)) {
      return {
        items: response.items,
        totalCount: response.totalCount || response.items.length,
      };
    }

    if (response && Array.isArray(response.data)) {
      return {
        items: response.data,
        totalCount: response.totalCount || response.data.length,
      };
    }

    if (Array.isArray(response)) {
      return {
        items: response,
        totalCount: response.length,
      };
    }

    console.log(
      "Unexpected WorkAreas Paginated API response structure:",
      response,
    );
    return { items: [], totalCount: 0 };
  } catch (error) {
    console.error("Failed to load work areas:", error);
    return { items: [], totalCount: 0 };
  }
}
