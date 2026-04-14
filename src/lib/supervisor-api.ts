import { createSearchableApi } from "./api-crud-factory";
import type {
  Supervisor,
  SupervisorsPaginatedRequest,
} from "@/types/supervisor";

// Create CRUD API using factory
const supervisorApi = createSearchableApi<Supervisor, any, any>(
  "/auths/supervisors",
);

// Export individual functions
export const {
  getAll: getAllSupervisors,
  getPaginated: getSupervisorsPaginated,
  search: searchSupervisors,
} = supervisorApi;

// Custom function for searching supervisors with keyword
export async function searchSupervisorsByKeyword(
  keyword?: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<{ items: Supervisor[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10 } = params;

  try {
    const response = await supervisorApi.getPaginated(pageNumber, pageSize, {
      keyword,
    });

    return {
      items: response.content,
      totalCount: response.totalElements,
    };
  } catch (error) {
    console.error("Failed to search supervisors:", error);
    return { items: [], totalCount: 0 };
  }
}
