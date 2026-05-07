import { createSearchableApi } from "./api-crud-factory";
import { getLocationsPaginated } from "./location-api";
import type { Client } from "@/types/contract";
import type { PaginatedRequest } from "@/types/common";

// Client form data types
export interface ClientCreateData {
  name: string;
  email: string;
}

export interface ClientUpdateData {
  name?: string;
  email?: string;
}

// Legacy interface for backward compatibility
export interface ClientsPaginatedRequest extends PaginatedRequest {}

// Create CRUD API using factory
const clientApi = createSearchableApi<
  Client,
  ClientCreateData,
  ClientUpdateData
>("/Clients");

// Export individual functions for backward compatibility
export const {
  create: createClient,
  getById: getClientById,
  update: updateClient,
  delete: deleteClient,
  getAll: getClients,
  getPaginated: getClientsPaginatedNew,
  search: searchClients,
} = clientApi;

// Legacy function for backward compatibility
export async function getClientsPaginated(
  params: ClientsPaginatedRequest = {},
): Promise<{ items: Client[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10, search, ...rest } = params;

  try {
    const response = await clientApi.getPaginated(pageNumber, pageSize, {
      search,
      ...rest,
    });

    return {
      items: response.content,
      totalCount: response.totalElements,
    };
  } catch (error) {
    console.error("Failed to load clients:", error);
    return { items: [], totalCount: 0 };
  }
}

// Get locations by client ID
export async function getLocationsByClient(clientId: string) {
  try {
    const response = await getLocationsPaginated({ clientId, pageSize: 50 });
    return response.items;
  } catch (error) {
    console.error("Failed to load locations by client:", error);
    return [];
  }
}
