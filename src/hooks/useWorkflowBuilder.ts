import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Task Assignment APIs
import {
  getTaskAssignments,
  getTaskAssignmentById,
  startTask,
  completeTask,
  createAdhocTask,
  getTaskAssignmentsByWorker,
  getTaskAssignmentsByWorkArea,
  getTaskAssignmentsByStatus,
  getTaskAssignmentsByDateRange,
} from "@/lib/task-assignment-api";

// Task Step Execution APIs
import {
  completeTaskStep,
  completeCheckBoxStep,
  completePhotoStep,
  completeSignatureStep,
  completeTextInputStep,
  completeTimerStep,
  completeQRCodeStep,
  completeLocationStep,
} from "@/lib/task-step-execution-api";

// SOP APIs
import {
  getSOPs,
  getSOPById,
  createSOP,
  updateSOP,
  deleteSOP,
} from "@/lib/sop-api";

// Step APIs
import {
  getSteps,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
} from "@/lib/step-api";

// Types
import type {
  CreateAdhocTaskData,
  StartTaskData,
  CompleteTaskData,
  SubmitStepExecutionData,
  TaskAssignmentStatus,
} from "@/types/task";

import type { CreateSOPData, UpdateSOPData, SOP } from "@/types/sop";

import type { CreateStepData, UpdateStepData, Step } from "@/types/sop";

import type { PaginationParams } from "@/types/common";

// Task Assignment Hooks (based on actual API)
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
    queryFn: () => getTaskAssignments(params),
  });
}

export function useTaskAssignment(id: string) {
  return useQuery({
    queryKey: ["task-assignments", id],
    queryFn: () => getTaskAssignmentById(id),
    enabled: !!id,
  });
}

export function useTaskAssignmentsByWorker(
  workerId: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "worker", workerId, params],
    queryFn: () => getTaskAssignmentsByWorker(workerId, params),
    enabled: !!workerId,
  });
}

export function useTaskAssignmentsByWorkArea(
  workAreaId: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "work-area", workAreaId, params],
    queryFn: () => getTaskAssignmentsByWorkArea(workAreaId, params),
    enabled: !!workAreaId,
  });
}

export function useTaskAssignmentsByStatus(
  status: TaskAssignmentStatus,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "status", status, params],
    queryFn: () => getTaskAssignmentsByStatus(status, params),
  });
}

export function useTaskAssignmentsByDateRange(
  fromDate: string,
  toDate: string,
  params?: PaginationParams,
) {
  return useQuery({
    queryKey: ["task-assignments", "date-range", fromDate, toDate, params],
    queryFn: () => getTaskAssignmentsByDateRange(fromDate, toDate, params),
    enabled: !!fromDate && !!toDate,
  });
}

export function useStartTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartTaskData }) =>
      startTask(id, data),
    onSuccess: (_, variables) => {
      toast.success("Task started successfully");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["task-assignments", variables.id],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to start task");
      console.error("Task start error:", error);
    },
  });
}

export function useCompleteTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTaskData }) =>
      completeTask(id, data),
    onSuccess: (_, variables) => {
      toast.success("Task completed successfully");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["task-assignments", variables.id],
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete task");
      console.error("Task completion error:", error);
    },
  });
}

export function useCreateAdhocTask(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdhocTask,
    onSuccess: () => {
      toast.success("Adhoc task created successfully");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create adhoc task");
      console.error("Adhoc task creation error:", error);
    },
  });
}

// Task Step Execution Hooks
export function useCompleteTaskStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitStepExecutionData }) =>
      completeTaskStep(id, data),
    onSuccess: () => {
      toast.success("Step completed successfully");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete step");
      console.error("Step completion error:", error);
    },
  });
}

export function useCompleteCheckBoxStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stepExecutionId,
      checked,
      note,
    }: {
      stepExecutionId: string;
      checked: boolean;
      note?: string;
    }) => completeCheckBoxStep(stepExecutionId, checked, note),
    onSuccess: () => {
      toast.success("Checkbox step completed");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete checkbox step");
      console.error("Checkbox step error:", error);
    },
  });
}

export function useCompletePhotoStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stepExecutionId,
      photoUrls,
      note,
    }: {
      stepExecutionId: string;
      photoUrls: string[];
      note?: string;
    }) => completePhotoStep(stepExecutionId, photoUrls, note),
    onSuccess: () => {
      toast.success("Photo step completed");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete photo step");
      console.error("Photo step error:", error);
    },
  });
}

export function useCompleteSignatureStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stepExecutionId,
      signatureUrl,
      signedBy,
    }: {
      stepExecutionId: string;
      signatureUrl: string;
      signedBy: string;
    }) => completeSignatureStep(stepExecutionId, signatureUrl, signedBy),
    onSuccess: () => {
      toast.success("Signature step completed");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete signature step");
      console.error("Signature step error:", error);
    },
  });
}

export function useCompleteTextInputStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stepExecutionId,
      text,
    }: {
      stepExecutionId: string;
      text: string;
    }) => completeTextInputStep(stepExecutionId, text),
    onSuccess: () => {
      toast.success("Text input step completed");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to complete text input step");
      console.error("Text input step error:", error);
    },
  });
}

// SOP Hooks (now implemented)
export function useSOPs(params?: PaginationParams) {
  return useQuery({
    queryKey: ["sops", params],
    queryFn: () => getSOPs(params),
  });
}

export function useSOP(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sops", id],
    queryFn: async () => {
      try {
        const result = await getSOPById(id);
        // Ensure we always return a value, never undefined
        return result || null;
      } catch (error: any) {
        // For 404 errors, throw a proper error instead of returning undefined
        if (error?.status === 404 || error?.message?.includes("404")) {
          throw new Error(`SOP with ID ${id} not found`);
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateSOP(onSuccess?: (sop: SOP) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSOP,
    onSuccess: (data) => {
      toast.success("SOP created successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Failed to create SOP");
      console.error("SOP creation error:", error);
    },
  });
}

export function useUpdateSOP(onSuccess?: (sop: SOP) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSOPData }) =>
      updateSOP(id, data),
    onSuccess: (data, variables) => {
      toast.success("SOP updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      queryClient.invalidateQueries({ queryKey: ["sops", variables.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Failed to update SOP");
      console.error("SOP update error:", error);
    },
  });
}

export function useDeleteSOP(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSOP,
    onSuccess: (_, deletedId) => {
      toast.success("SOP deleted successfully");
      // Remove the specific SOP from cache immediately
      queryClient.removeQueries({ queryKey: ["sops", deletedId] });
      // Cancel any outgoing queries for this SOP
      queryClient.cancelQueries({ queryKey: ["sops", deletedId] });
      // Invalidate the SOPs list to refresh it
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to delete SOP");
      console.error("SOP deletion error:", error);
    },
  });
}

// Step Hooks (now implemented)
export function useSteps(params?: PaginationParams) {
  return useQuery({
    queryKey: ["steps", params],
    queryFn: () => getSteps(params),
  });
}

export function useStep(id: string) {
  return useQuery({
    queryKey: ["steps", id],
    queryFn: () => getStepById(id),
    enabled: !!id,
  });
}

export function useCreateStep(onSuccess?: (step: Step) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStep,
    onSuccess: (data) => {
      toast.success("Step created successfully");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Failed to create step");
      console.error("Step creation error:", error);
    },
  });
}

export function useUpdateStep(onSuccess?: (step: Step) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStepData }) =>
      updateStep(id, data),
    onSuccess: (data, variables) => {
      toast.success("Step updated successfully");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      queryClient.invalidateQueries({ queryKey: ["steps", variables.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error("Failed to update step");
      console.error("Step update error:", error);
    },
  });
}

export function useDeleteStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStep,
    onSuccess: () => {
      toast.success("Step deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to delete step");
      console.error("Step deletion error:", error);
    },
  });
}
