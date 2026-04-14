import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdhocTask, startTask } from "@/lib/task-assignment-api";
import { WorkAreaSupervisorService } from "@/lib/services/work-area-supervisor.service";
import type { CreateAdhocTaskData, StartTaskData } from "@/types/task";

/**
 * Hook for creating tasks with automatic supervisor assignment
 * This ensures that when a task is created, the worker is automatically
 * assigned to the supervisor in the specified work area
 */
export function useCreateTaskWithSupervisorAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateAdhocTaskData & { supervisorId?: string },
    ) => {
      // Create the task first
      const task = await createAdhocTask(data);

      // If supervisor is specified, auto-assign worker to supervisor
      if (data.supervisorId && data.workAreaId && data.assignedToWorkerId) {
        await WorkAreaSupervisorService.autoAssignWorkerToSupervisor(
          data.workAreaId,
          data.supervisorId,
          data.assignedToWorkerId,
        );
      }

      return task;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["workAreaSupervisors"] });
    },
  });
}

/**
 * Hook for starting tasks with supervisor assignment check
 * This ensures proper supervision is in place when tasks start
 */
export function useStartTaskWithSupervisorCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      taskId: string;
      data: StartTaskData;
      workAreaId?: string;
      supervisorId?: string;
    }) => {
      const { taskId, data, workAreaId, supervisorId } = params;

      // Start the task first
      const result = await startTask(taskId, data);

      // If supervisor and work area info is available, ensure assignment
      if (supervisorId && workAreaId && data.workerId) {
        await WorkAreaSupervisorService.autoAssignWorkerToSupervisor(
          workAreaId,
          supervisorId,
          data.workerId,
        );
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["workAreaSupervisors"] });
    },
  });
}

/**
 * Hook for bulk worker assignment to supervisor
 * Useful for assigning multiple workers at once
 */
export function useBulkAssignWorkersToSupervisor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      workAreaId: string;
      supervisorId: string;
      workerIds: string[];
    }) => {
      await WorkAreaSupervisorService.assignWorkersToSupervisor(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workAreaSupervisors"] });
    },
  });
}
