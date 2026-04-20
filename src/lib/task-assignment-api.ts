import { createSearchableApi } from "./api-crud-factory";
import type { PaginatedResponse } from "@/types/common";
import type {
  TaskAssignment,
  CreateAdhocTaskData,
  StartTaskData,
  CompleteTaskData,
  StartTaskResponse,
  TaskAssignmentStatus,
} from "@/types/task";
import type { PaginationParams } from "@/types/common";
import { api } from "./api";

// Task Assignment API using CRUD factory for basic operations with consistent endpoint casing
const taskAssignmentApi = createSearchableApi<
  TaskAssignment,
  CreateAdhocTaskData,
  Partial<CreateAdhocTaskData>
>("/TaskAssignments");

// Export basic CRUD functions
export const { getById: getTaskAssignmentById, search: searchTaskAssignments } =
  taskAssignmentApi;

// Custom function for getting Task Assignments with advanced filtering
export async function getTaskAssignments(
  params: {
    assignedToWorkerId?: string;
    workAreaId?: string;
    status?: TaskAssignmentStatus;
    fromDate?: string; // date format
    toDate?: string; // date format
    pageNumber?: number;
    pageSize?: number;
  } = {},
): Promise<PaginatedResponse<TaskAssignment>> {
  const {
    assignedToWorkerId,
    workAreaId,
    status,
    fromDate,
    toDate,
    pageNumber = 1,
    pageSize = 10,
  } = params;

  // Use CRUD factory with additional filters
  return taskAssignmentApi.getPaginated(pageNumber, pageSize, {
    assignedToWorkerId,
    workAreaId,
    status,
    fromDate,
    toDate,
  });
}

// Task Assignment Actions (specific to this API)
export async function startTask(
  id: string,
  data: StartTaskData,
): Promise<StartTaskResponse> {
  return api.post<StartTaskResponse>(`/TaskAssignments/${id}/start`, data);
}

export async function completeTask(
  id: string,
  data: CompleteTaskData,
): Promise<void> {
  return api.post(`/TaskAssignments/${id}/complete`, data);
}

export async function updateTaskAssignmentStatus(
  id: string,
  status: TaskAssignmentStatus,
): Promise<void> {
  return api.patch(`/TaskAssignments/${id}/status`, JSON.stringify(status), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function createAdhocTask(
  data: CreateAdhocTaskData,
): Promise<TaskAssignment> {
  return api.post<TaskAssignment>("/TaskAssignments/adhoc", data);
}

// Convenience functions for common filtering scenarios
export async function getTaskAssignmentsByWorker(
  workerId: string,
  params: PaginationParams = {},
): Promise<PaginatedResponse<TaskAssignment>> {
  return getTaskAssignments({
    assignedToWorkerId: workerId,
    ...params,
  });
}

export async function getTaskAssignmentsByWorkArea(
  workAreaId: string,
  params: PaginationParams = {},
): Promise<PaginatedResponse<TaskAssignment>> {
  return getTaskAssignments({
    workAreaId,
    ...params,
  });
}

export async function getTaskAssignmentsByStatus(
  status: TaskAssignmentStatus,
  params: PaginationParams = {},
): Promise<PaginatedResponse<TaskAssignment>> {
  return getTaskAssignments({
    status,
    ...params,
  });
}

export async function getTaskAssignmentsByDateRange(
  fromDate: string,
  toDate: string,
  params: PaginationParams = {},
): Promise<PaginatedResponse<TaskAssignment>> {
  return getTaskAssignments({
    fromDate,
    toDate,
    ...params,
  });
}
