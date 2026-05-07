/**
 * Custom hooks for Task Schedule operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiToasts } from "@/lib/utils/toast-utils";
import {
  getTaskSchedulesPaginated,
  getTaskScheduleById,
  createTaskSchedule,
  updateTaskSchedule,
  deleteTaskSchedule,
  activateTaskSchedule,
  deactivateTaskSchedule,
  getTaskSchedulesByWorkArea,
  TaskSchedulesPaginatedRequest,
} from "@/lib/task-schedule-api";
import { PaginatedRequest } from "@/types/common";
import {
  TaskSchedule,
  CreateTaskScheduleData,
  UpdateTaskScheduleData,
} from "@/types/schedule";

// Query keys
export const taskScheduleKeys = {
  all: ["taskSchedules"] as const,
  lists: () => [...taskScheduleKeys.all, "list"] as const,
  list: (params: TaskSchedulesPaginatedRequest) =>
    [...taskScheduleKeys.lists(), params] as const,
  details: () => [...taskScheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...taskScheduleKeys.details(), id] as const,
  byWorkArea: (workAreaId: string, params: PaginatedRequest) =>
    [...taskScheduleKeys.all, "byWorkArea", workAreaId, params] as const,
};

// Get paginated task schedules
export function useTaskSchedules(params: TaskSchedulesPaginatedRequest = {}) {
  return useQuery({
    queryKey: taskScheduleKeys.list(params),
    queryFn: () => getTaskSchedulesPaginated(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single task schedule
export function useTaskSchedule(id: string) {
  return useQuery({
    queryKey: taskScheduleKeys.detail(id),
    queryFn: () => getTaskScheduleById(id),
    enabled: !!id,
  });
}

// Create task schedule mutation
export function useCreateTaskSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskScheduleData) => createTaskSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.lists() });
      apiToasts.createSuccess("lịch trình");
    },
    onError: (error: any) => {
      apiToasts.createError("lịch trình");
    },
  });
}



// Update task schedule mutation
export function useUpdateTaskSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskScheduleData }) =>
      updateTaskSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.detail(id) });
      apiToasts.updateSuccess("lịch trình");
    },
    onError: (error: any) => {
      apiToasts.updateError("lịch trình");
    },
  });
}

// Delete task schedule mutation
export function useDeleteTaskSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTaskSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.lists() });
      apiToasts.deleteSuccess("lịch trình");
    },
    onError: (error: any) => {
      apiToasts.deleteError("lịch trình");
    },
  });
}

// Activate task schedule mutation
export function useActivateTaskSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateTaskSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.detail(id) });
      apiToasts.updateSuccess("kích hoạt lịch trình");
    },
    onError: (error: any) => {
      apiToasts.updateError("kích hoạt lịch trình");
    },
  });
}

// Deactivate task schedule mutation
export function useDeactivateTaskSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateTaskSchedule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskScheduleKeys.detail(id) });
      apiToasts.updateSuccess("hủy kích hoạt lịch trình");
    },
    onError: (error: any) => {
      apiToasts.updateError("hủy kích hoạt lịch trình");
    },
  });
}

// Get task schedules by work area
export function useTaskSchedulesByWorkArea(
  workAreaId: string,
  params: PaginatedRequest = {},
) {
  return useQuery({
    queryKey: taskScheduleKeys.byWorkArea(workAreaId, params),
    queryFn: () => getTaskSchedulesByWorkArea(workAreaId, params),
    enabled: !!workAreaId,
  });
}
