import { createSearchableApi } from "./api-crud-factory";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type { Step, CreateStepData, UpdateStepData } from "@/types/sop";

// Step API using CRUD factory with consistent endpoint casing
const stepApi = createSearchableApi<Step, CreateStepData, UpdateStepData>(
  "/Steps",
);

// Export individual functions for backward compatibility
export const {
  create: createStep,
  getById: getStepById,
  update: updateStep,
  delete: deleteStep,
  getAll: getAllSteps,
  search: searchSteps,
} = stepApi;

// Custom paginated function to maintain existing interface
export async function getSteps(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Step>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return stepApi.getPaginated(pageNumber, pageSize, { search });
}
