import { useQuery } from "@tanstack/react-query";
import {
  getTaskAssignments,
  getTaskAssignmentById,
} from "@/lib/task-assignment-api";
import { generateMockTaskAssignments } from "@/lib/mock-task-assignments";
import type { TaskAssignmentStatus } from "@/types/task";
import type { PaginationParams } from "@/types/common";

// Enable mock data for development
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Hook for fetching task assignments with optional filters
 */
export function useTaskAssignments(params?: {
  assignedToWorkerId?: string;
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
      // Use mock data if enabled or if no date range provided
      if (USE_MOCK_DATA && params?.fromDate && params?.toDate) {
        return generateMockTaskAssignments(params.fromDate, params.toDate);
      }

      try {
        const result = await getTaskAssignments(params);

        // If API returns empty data and we have date range, use mock data
        if (
          (!result.content || result.content.length === 0) &&
          params?.fromDate &&
          params?.toDate
        ) {
          return generateMockTaskAssignments(params.fromDate, params.toDate);
        }

        return result;
      } catch (error) {
        // Fallback to mock data if API fails
        if (params?.fromDate && params?.toDate) {
          return generateMockTaskAssignments(params.fromDate, params.toDate);
        }
        throw error;
      }
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
