/**
 * Task Schedule API functions
 * Handles CRUD operations for task schedules based on actual API endpoints
 */

import { api } from "./api";
import {
  TaskSchedule,
  CreateTaskScheduleData,
  UpdateTaskScheduleData,
} from "@/types/schedule";
import { PaginatedResponse } from "./api-response-parser";

// Request interfaces
export interface TaskSchedulesPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sopId?: string;
  workAreaId?: string;
  assigneeId?: string;
  isActive?: boolean;
}

// Get paginated task schedules
export async function getTaskSchedulesPaginated(
  params: TaskSchedulesPaginatedRequest = {},
): Promise<PaginatedResponse<TaskSchedule>> {
  const queryParams = new URLSearchParams();

  if (params.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.sopId) queryParams.append("sopId", params.sopId);
  if (params.workAreaId) queryParams.append("workAreaId", params.workAreaId);
  if (params.assigneeId) queryParams.append("assigneeId", params.assigneeId);
  if (params.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());

  const url = `/TaskSchedules${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return api.get<PaginatedResponse<TaskSchedule>>(url);
}

// Get single task schedule by ID
export async function getTaskScheduleById(id: string): Promise<TaskSchedule> {
  return api.get<TaskSchedule>(`/TaskSchedules/${id}`);
}

// Create new task schedule
export async function createTaskSchedule(
  data: CreateTaskScheduleData,
): Promise<TaskSchedule> {
  return api.post<TaskSchedule>("/TaskSchedules", data);
}

// Update task schedule
export async function updateTaskSchedule(
  id: string,
  data: UpdateTaskScheduleData,
): Promise<TaskSchedule> {
  return api.put<TaskSchedule>(`/TaskSchedules/${id}`, data);
}

// Delete task schedule
export async function deleteTaskSchedule(id: string): Promise<void> {
  return api.delete(`/TaskSchedules/${id}`);
}

// Activate task schedule
export async function activateTaskSchedule(id: string): Promise<void> {
  return api.patch(`/TaskSchedules/${id}/activate`);
}

// Deactivate task schedule
export async function deactivateTaskSchedule(id: string): Promise<void> {
  return api.patch(`/TaskSchedules/${id}/deactivate`);
}
