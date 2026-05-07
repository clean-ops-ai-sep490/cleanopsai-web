import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type {
  EnvironmentType,
  CreateEnvironmentTypeData,
  UpdateEnvironmentTypeData,
} from "@/types/sop";
import type { RiskLevel } from "@/types/common";
import type { PaginatedRequest } from "@/types/common";

// Legacy interface for backward compatibility
export interface EnvironmentTypesPaginatedRequest extends PaginatedRequest {}

// Environment Type API using CRUD factory with consistent endpoint casing
const environmentTypeApi = createSearchableApi<
  EnvironmentType,
  CreateEnvironmentTypeData,
  UpdateEnvironmentTypeData
>("/EnvironmentTypes");

// Export individual functions for backward compatibility
export const {
  create: createEnvironmentType,
  getById: getEnvironmentTypeById,
  update: updateEnvironmentType,
  delete: deleteEnvironmentType,
  getAll: getAllEnvironmentTypes,
  getPaginated: getEnvironmentTypesPaginatedNew,
  search: searchEnvironmentTypes,
} = environmentTypeApi;

// Legacy function for backward compatibility
export async function getEnvironmentTypesPaginated(
  params: EnvironmentTypesPaginatedRequest = {},
): Promise<{ items: EnvironmentType[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10, search, ...rest } = params;

  try {
    const response = await environmentTypeApi.getPaginated(
      pageNumber,
      pageSize,
      {
        search,
        ...rest,
      },
    );

    return {
      items: response.content,
      totalCount: response.totalElements,
    };
  } catch (error) {
    console.error("Failed to load environment types:", error);
    return { items: [], totalCount: 0 };
  }
}

// Custom paginated function to maintain existing interface
export async function getEnvironmentTypes(
  params: PaginationParams = {},
): Promise<PaginatedResponse<EnvironmentType>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return environmentTypeApi.getPaginated(pageNumber, pageSize, { search });
}
