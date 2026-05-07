import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskAssignments,
  getTaskAssignmentById,
  deleteTaskAssignment,
  updateTaskAssignment,
} from "@/lib/task-assignment-api";
import type { TaskAssignmentStatus } from "@/types/task";
import type { PaginationParams } from "@/types/common";
import type { TaskAssignmentUpdatePayload } from "@/types/task-assignment";
import { toastUtils } from "@/lib/utils/toast-utils";

/**
 * Hook for fetching task assignments with optional filters
 */
export function useTaskAssignments(params?: {
  assigneeId?: string;
  workAreaId?: string;
  status?: TaskAssignmentStatus;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["task-assignments", params],
    queryFn: async () => {
      return getTaskAssignments(params);
    },
  });
}

/**
 * Hook for fetching a single task assignment by ID
 */
export function useTaskAssignment(id: string) {
  return useQuery({
    queryKey: ["task-assignments", id],
    queryFn: () => getTaskAssignmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook for fetching task assignments by worker ID
 */
export function useTaskAssignmentsByWorker(
  workerId: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "worker", workerId, params],
    queryFn: () => getTaskAssignments({ assigneeId: workerId, ...params }),
    enabled: !!workerId,
  });
}

/**
 * Hook for fetching task assignments by work area ID
 */
export function useTaskAssignmentsByWorkArea(
  workAreaId: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "work-area", workAreaId, params],
    queryFn: () => getTaskAssignments({ workAreaId, ...params }),
    enabled: !!workAreaId,
  });
}

/**
 * Hook for fetching task assignments by status
 */
export function useTaskAssignmentsByStatus(
  status: TaskAssignmentStatus,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "status", status, params],
    queryFn: () => getTaskAssignments({ status, ...params }),
  });
}

/**
 * Hook for deleting a task assignment
 */
export function useDeleteTaskAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaskAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      toastUtils.success("Đã hủy công việc thành công.");
    },
    onError: (error: any) => {
      console.error("Failed to delete task assignment:", error);
      toastUtils.error("Không thể hủy công việc. Vui lòng thử lại.");
    },
  });
}

/**
 * Hook for updating a task assignment
 */
export function useUpdateTaskAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TaskAssignmentUpdatePayload;
    }) => updateTaskAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      toastUtils.success("Đã cập nhật công việc thành công.");
    },
    onError: (error: any) => {
      console.error("Failed to update task assignment:", error);
      toastUtils.error("Không thể cập nhật công việc. Vui lòng thử lại.");
    },
  });
}


/**
 * Hook for fetching task assignments within a date range
 */
export function useTaskAssignmentsByDateRange(
  fromDate: string,
  toDate: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "date-range", fromDate, toDate, params],
    queryFn: () => getTaskAssignments({ fromDate, toDate, ...params }),
    enabled: !!fromDate && !!toDate,
  });
}
