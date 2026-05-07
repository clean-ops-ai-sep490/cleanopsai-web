import { createSearchableApi } from "./api-crud-factory";
import type { PaginatedResponse, PaginationParams } from "@/types/common";

// PPE type definition
export interface PPE {
  id: string;
  actionKey: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface CreatePPEData {
  actionKey: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdatePPEData {
  actionKey?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

// PPE API using CRUD factory
const ppeApi = createSearchableApi<PPE, CreatePPEData, UpdatePPEData>(
  "/PpeItems",
);

// Export individual functions
export const {
  create: createPPE,
  getById: getPPEById,
  update: updatePPE,
  delete: deletePPE,
  getAll: getAllPPEs,
  search: searchPPEs,
} = ppeApi;

// Custom paginated function
export async function getPPEs(
  params: PaginationParams = {},
): Promise<PaginatedResponse<PPE>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return ppeApi.getPaginated(pageNumber, pageSize, { search });
}
