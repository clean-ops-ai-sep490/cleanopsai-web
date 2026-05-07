import { createSearchableApi } from "./api-crud-factory";
import { api } from "./api";
import type {
  Supervisor,
  CreateSupervisorData,
  UpdateSupervisorData,
  WorkAreaSupervisorAssignment,
  AssignSupervisorToWorkAreaData,
  UnassignSupervisorFromWorkAreaData,
} from "@/types/supervisor";
import type { PaginatedRequest, PaginatedResponse } from "@/types/common";

// Create CRUD API using factory
const supervisorApi = createSearchableApi<
  Supervisor,
  CreateSupervisorData,
  UpdateSupervisorData
>("/Supervisors");

// Export individual functions for backward compatibility
export const {
  create: createSupervisor,
  getById: getSupervisorById,
  update: updateSupervisor,
  delete: deleteSupervisor,
  getAll: getSupervisors,
  getPaginated: getSupervisorsPaginated,
  search: searchSupervisors,
} = supervisorApi;

// Work Area Supervisor Assignment functions
export async function getWorkAreaSupervisorAssignments(
  params: PaginatedRequest = {},
): Promise<PaginatedResponse<WorkAreaSupervisorAssignment>> {
  const { pageNumber = 1, pageSize = 10, search, ...rest } = params;

  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  try {
    const response = await api.get<
      PaginatedResponse<WorkAreaSupervisorAssignment>
    >(`/WorkAreaSupervisors?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error("Failed to load work area supervisor assignments:", error);
    throw error;
  }
}

export async function assignSupervisorToWorkArea(
  data: AssignSupervisorToWorkAreaData,
): Promise<WorkAreaSupervisorAssignment> {
  try {
    const response = await api.post<WorkAreaSupervisorAssignment>(
      "/WorkAreaSupervisors/assign",
      data,
    );
    return response;
  } catch (error) {
    console.error("Failed to assign supervisor to work area:", error);
    throw error;
  }
}

export async function getAuthSupervisors(
  params: PaginatedRequest = {},
): Promise<PaginatedResponse<Supervisor>> {
  const queryParams = new URLSearchParams({
    pageNumber: (params.pageNumber || 1).toString(),
    pageSize: (params.pageSize || 10).toString(),
  });

  if (params.search) {
    queryParams.append("search", params.search);
  }

  try {
    const response = await api.get<PaginatedResponse<Supervisor>>(
      `/Auths/supervisors?${queryParams.toString()}`,
    );
    return response;
  } catch (error) {
    console.error("Failed to load auth supervisors:", error);
    throw error;
  }
}

export async function unassignSupervisorFromWorkArea(
  assignmentId: string,
): Promise<void> {
  try {
    await api.delete(`/WorkAreaSupervisors/${assignmentId}`);
  } catch (error) {
    console.error("Failed to unassign supervisor from work area:", error);
    throw error;
  }
}

export async function getWorkAreaSupervisorsByWorkArea(
  workAreaId: string,
): Promise<WorkAreaSupervisorAssignment[]> {
  try {
    const response = await api.get<WorkAreaSupervisorAssignment[]>(
      `/WorkAreaSupervisors/work-area/${workAreaId}`,
    );
    return response;
  } catch (error) {
    console.error("Failed to load supervisors for work area:", error);
    throw error;
  }
}

export async function getAvailableSupervisors(): Promise<Supervisor[]> {
  try {
    const response = await api.get<Supervisor[]>("/Supervisors/available");
    return response;
  } catch (error) {
    console.error("Failed to load available supervisors:", error);
    throw error;
  }
}
