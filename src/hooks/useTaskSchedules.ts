/**
 * Custom hooks for Task Schedule operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTaskSchedulesPaginated,
  getTaskScheduleById,
  createTaskSchedule,
  updateTaskSchedule,
  deleteTaskSchedule,
  activateTaskSchedule,
  deactivateTaskSchedule,
  TaskSchedulesPaginatedRequest,
} from "@/lib/task-schedule-api";
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
      toast.success("Tạo lịch trình thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo lịch trình");
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
      toast.success("Cập nhật lịch trình thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật lịch trình");
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
      toast.success("Xóa lịch trình thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa lịch trình");
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
      toast.success("Kích hoạt lịch trình thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi kích hoạt lịch trình");
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
      toast.success("Hủy kích hoạt lịch trình thành công");
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Có lỗi xảy ra khi hủy kích hoạt lịch trình",
      );
    },
  });
}
