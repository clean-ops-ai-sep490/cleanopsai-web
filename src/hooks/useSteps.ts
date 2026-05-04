import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiToasts } from "@/lib/utils/toast-utils";
import {
  getSteps,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
} from "@/lib/step-api";
import type { CreateStepData, UpdateStepData, Step } from "@/types/sop";
import type { PaginationParams } from "@/types/common";

/**
 * Hook for fetching steps with pagination
 */
export function useSteps(params?: PaginationParams) {
  return useQuery({
    queryKey: ["steps", params],
    queryFn: () => getSteps(params),
  });
}

/**
 * Hook for fetching a single step by ID
 */
export function useStep(id: string) {
  return useQuery({
    queryKey: ["steps", id],
    queryFn: () => getStepById(id),
    enabled: !!id,
  });
}

/**
 * Hook for creating a new step
 */
export function useCreateStep(onSuccess?: (step: Step) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStep,
    onSuccess: (data) => {
      apiToasts.createSuccess("bước");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      onSuccess?.(data);
    },
    onError: (error) => {
      apiToasts.createError("bước");
      console.error("Step creation error:", error);
    },
  });
}

/**
 * Hook for updating an existing step
 */
export function useUpdateStep(onSuccess?: (step: Step) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStepData }) =>
      updateStep(id, data),
    onSuccess: (data, variables) => {
      apiToasts.updateSuccess("bước");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      queryClient.invalidateQueries({ queryKey: ["steps", variables.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      apiToasts.updateError("bước");
      console.error("Step update error:", error);
    },
  });
}

/**
 * Hook for deleting a step
 */
export function useDeleteStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStep,
    onSuccess: () => {
      apiToasts.deleteSuccess("bước");
      queryClient.invalidateQueries({ queryKey: ["steps"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.deleteError("bước");
      console.error("Step deletion error:", error);
    },
  });
}
