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

// Generate task assignments from task schedules
export interface GenerateTaskAssignmentsRequest {
  taskScheduleIds: string[];
  fromDate: string; // Format: "YYYY-MM-DD"
  toDate: string; // Format: "YYYY-MM-DD"
}

export interface GenerateTaskAssignmentsResponse {
  generatedCount: number;
  taskAssignmentIds: string[];
  message?: string;
}

export async function generateTaskAssignments(
  data: GenerateTaskAssignmentsRequest,
): Promise<GenerateTaskAssignmentsResponse> {
  return api.post<GenerateTaskAssignmentsResponse>(
    "/TaskSchedules/taskassignments/generate",
    data,
  );
}

// Create task schedule with work area supervisor assignment
// Tương tự như SLA: tạo SLA trước -> tạo SLA-shift và SLA-task với slaId
// Ở đây: tạo task schedule trước -> tạo work area supervisor assignment với workAreaId
export async function createTaskScheduleWithAssignment(
  taskData: CreateTaskScheduleData & { supervisorId: string },
): Promise<TaskSchedule> {
  // Import the work area supervisor API function
  const { assignWorkersToSupervisor } =
    await import("./work-area-supervisor-api");

  try {
    // 1. Tạo task schedule trước (giống như tạo SLA trước)
    const { supervisorId, ...taskScheduleData } = taskData;
    const taskSchedule = await createTaskSchedule(taskScheduleData);

    // 2. Sau đó tạo work area supervisor assignment
    // (giống như tạo SLA-shift và SLA-task sau khi có slaId)
    // Sử dụng workAreaId từ taskData và assigneeId làm workerIds
    await assignWorkersToSupervisor({
      workAreaId: taskData.workAreaId,
      supervisorId: supervisorId,
      workerIds: [taskData.assigneeId], // assigneeId chính là worker được assign
    });

    return taskSchedule;
  } catch (error) {
    console.error("Failed to create task schedule with assignment:", error);
    throw error;
  }
}
