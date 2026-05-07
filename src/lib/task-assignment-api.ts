import { api } from "./api";
import type {
  TaskAssignment,
  TaskAssignmentResponse,
  TaskAssignmentFilters,
  TaskAssignmentUpdatePayload,
} from "@/types/task-assignment";

export async function getTaskAssignments(
  filters?: TaskAssignmentFilters,
): Promise<TaskAssignmentResponse> {
  const params = new URLSearchParams();

  if (filters?.assigneeId) params.append("assigneeId", filters.assigneeId);
  if (filters?.workAreaId) params.append("workAreaId", filters.workAreaId);
  if (filters?.fromDate) params.append("fromDate", filters.fromDate);
  if (filters?.toDate) params.append("toDate", filters.toDate);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.isAdhocTask !== undefined)
    params.append("isAdhocTask", String(filters.isAdhocTask));
  if (filters?.pageNumber)
    params.append("pageNumber", String(filters.pageNumber));
  if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

  const queryString = params.toString();
  const url = `/TaskAssignments${queryString ? `?${queryString}` : ""}`;

  return api.get<TaskAssignmentResponse>(url);
}

export async function getTaskAssignmentById(
  id: string,
): Promise<TaskAssignment> {
  return api.get<TaskAssignment>(`/TaskAssignments/${id}`);
}

/**
 * Full update of a task assignment (PUT)
 * Used for reassigning tasks to different workers
 */
export async function updateTaskAssignment(
  id: string,
  data: TaskAssignmentUpdatePayload,
): Promise<TaskAssignment> {
  return api.put<TaskAssignment>(`/TaskAssignments/${id}`, data);
}

/**
 * Update only the status of a task assignment (PATCH)
 */
export async function updateTaskAssignmentStatus(
  id: string,
  status: string,
): Promise<void> {
  return api.patch(`/TaskAssignments/${id}/status`, status);
}

export async function cancelTaskAssignment(id: string): Promise<void> {
  return api.patch(`/TaskAssignments/${id}/cancel`);
}

export async function deleteTaskAssignment(id: string): Promise<void> {
  return api.delete(`/TaskAssignments/${id}`);
}
