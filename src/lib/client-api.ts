import { api } from "./api";
import type { Client } from "@/types/contract";

export interface ClientsPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export async function createClient(data: {
  name: string;
  email: string;
}): Promise<Client> {
  return api.post<Client>("/Clients", data);
}

export async function getClients(): Promise<Client[]> {
  const response = await api.get<Client[] | { data: Client[] } | any>(
    "/Clients",
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

  console.log("Unexpected Clients API response structure:", response);
  return [];
}

export async function getClientsPaginated(
  params: ClientsPaginatedRequest = {},
): Promise<{ items: Client[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 50, search } = params;

  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  try {
    const response = await api.get<any>(`/Clients?${queryParams.toString()}`);

    console.log("Clients Paginated API Response:", response);

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
      "Unexpected Clients Paginated API response structure:",
      response,
    );
    return { items: [], totalCount: 0 };
  } catch (error) {
    console.error("Failed to load clients:", error);
    return { items: [], totalCount: 0 };
  }
}

export async function getClientById(id: string): Promise<Client> {
  return api.get<Client>(`/Clients/${id}`);
}

export async function updateClient(
  id: string,
  data: { name: string; email: string },
): Promise<Client> {
  return api.put<Client>(`/Clients/${id}`, data);
}

export async function deleteClient(id: string): Promise<void> {
  return api.delete(`/Clients/${id}`);
}
