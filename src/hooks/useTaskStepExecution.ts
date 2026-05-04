import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiToasts } from "@/lib/utils/toast-utils";
import {
  completeTaskStep,
  completeCheckBoxStep,
  completePhotoStep,
  completeSignatureStep,
  completeTextInputStep,
} from "@/lib/task-step-execution-api";
import type { SubmitStepExecutionData } from "@/types/task";

/**
 * Hook for completing a generic task step
 */
export function useCompleteTaskStep(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitStepExecutionData }) =>
      completeTaskStep(id, data),
    onSuccess: () => {
      apiToasts.updateSuccess("hoàn thành bước");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành bước");
      console.error("Step completion error:", error);
    },
  });
}

/**
 * Hook for completing a checkbox step
 */
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
      apiToasts.updateSuccess("hoàn thành checkbox");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành checkbox");
      console.error("Checkbox step error:", error);
    },
  });
}

/**
 * Hook for completing a photo step
 */
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
      apiToasts.updateSuccess("hoàn thành chụp ảnh");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành chụp ảnh");
      console.error("Photo step error:", error);
    },
  });
}

/**
 * Hook for completing a signature step
 */
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
      apiToasts.updateSuccess("hoàn thành chữ ký");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành chữ ký");
      console.error("Signature step error:", error);
    },
  });
}

/**
 * Hook for completing a text input step
 */
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
      apiToasts.updateSuccess("hoàn thành nhập text");
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.updateError("hoàn thành nhập text");
      console.error("Text input step error:", error);
    },
  });
}
