import { createSearchableApi } from "./api-crud-factory";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type { SOP, CreateSOPData, UpdateSOPData } from "@/types/sop";

// SOP API using CRUD factory with consistent endpoint casing
const sopApi = createSearchableApi<SOP, CreateSOPData, UpdateSOPData>("/Sops");

// Export individual functions for backward compatibility
export const {
  create: createSOP,
  getById: getSOPById,
  update: updateSOP,
  delete: deleteSOP,
  getAll: getAllSOPs,
  search: searchSOPs,
} = sopApi;

// Custom paginated function to maintain existing interface
export async function getSOPs(
  params: PaginationParams = {},
): Promise<PaginatedResponse<SOP>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return sopApi.getPaginated(pageNumber, pageSize, { search });
}
