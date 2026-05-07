import { api } from "./api";
import { createSearchableApi } from "./api-crud-factory";
import type {
  WorkAreaDetail,
  CreateWorkAreaDetailData,
  UpdateWorkAreaDetailData,
} from "@/types/work-area-detail";

// Create CRUD API using factory
const workAreaDetailApi = createSearchableApi<
  WorkAreaDetail,
  CreateWorkAreaDetailData,
  UpdateWorkAreaDetailData
>("/WorkAreaDetails");

// Export individual functions
export const {
  create: createWorkAreaDetail,
  getById: getWorkAreaDetailById,
  update: updateWorkAreaDetail,
  delete: deleteWorkAreaDetail,
  getAll: getAllWorkAreaDetails,
  getPaginated: getWorkAreaDetailsPaginated,
  search: searchWorkAreaDetails,
} = workAreaDetailApi;

// Get work area details by workAreaId - following existing pattern like client-api.ts
export async function  getWorkAreaDetailsByWorkArea(
  workAreaId: string,
  params: { pageNumber?: number; pageSize?: number } = {},
): Promise<{ items: WorkAreaDetail[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10 } = params;

  try {
    const response = await workAreaDetailApi.getPaginated(
      pageNumber,
      pageSize,
      {
        workAreaId,
      },
    );

    return {
      items: response.content,
      totalCount: response.totalElements,
    };
  } catch (error) {
    console.error("Failed to load work area details by work area:", error);
    return { items: [], totalCount: 0 };
  }
}

export async function getWorkAreaDetailsByWorkAreaId(
  workAreaId: string,
  params: { pageNumber?: number; pageSize?: number } = {}
): Promise<{ items: WorkAreaDetail[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10 } = params;

  console.log("=== API CALL ===", `/WorkAreaDetails/work-area/${workAreaId}`);

  try {
    const response = await api.get<any>(
      `/WorkAreaDetails/work-area/${workAreaId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    return {
      items: response.content ?? [],
      totalCount: response.totalElements ?? 0,
    };
  } catch (error) {
    console.error("Failed:", error);
    return { items: [], totalCount: 0 };
  }
}
