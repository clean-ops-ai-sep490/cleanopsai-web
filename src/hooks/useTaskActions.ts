import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiToasts } from "@/lib/utils/toast-utils";
import { updateTaskAssignmentStatus } from "@/lib/task-assignment-api";
import type {
  CreateAdhocTaskData,
  StartTaskData,
  CompleteTaskData,
} from "@/types/task";

/**
 * Hook for starting a task (updating status to InProgress)
 */
export function useStartTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartTaskData }) =>
      updateTaskAssignmentStatus(id, "InProgress"),
    onSuccess: (_, variables) => {
      apiToasts.updateSuccess("bắt đầu công việc");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["task-assignments", variables.id],
      });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("bắt đầu công việc");
      console.error("Task start error:", error);
    },
  });
}

/**
 * Hook for completing a task (updating status to Completed)
 */
export function useCompleteTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTaskData }) =>
      updateTaskAssignmentStatus(id, "Completed"),
    onSuccess: (_, variables) => {
      apiToasts.updateSuccess("hoàn thành công việc");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["task-assignments", variables.id],
      });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành công việc");
      console.error("Task completion error:", error);
    },
  });
}

/**
 * Hook for creating an adhoc task
 */
export function useCreateAdhocTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdhocTaskData) => {
      // TODO: Implement createAdhocTask API endpoint
      throw new Error("createAdhocTask API not yet implemented");
    },
    onSuccess: () => {
      apiToasts.createSuccess("công việc đột xuất");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.createError("công việc đột xuất");
      console.error("Adhoc task creation error:", error);
    },
  });
}
