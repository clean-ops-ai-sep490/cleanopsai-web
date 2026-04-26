import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toastUtils } from "@/lib/utils/toast-utils";
import { FormService } from "@/lib/services/form.service";

interface UseFormSubmissionOptions<T, R> {
  mutationFn: (data: T) => Promise<R>;
  queryKey?: string[];
  onSuccess?: (data: R) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  transform?: (data: T) => T;
}

/**
 * Form Submission Hook - Handles only form submission logic
 * Follows SRP by focusing only on submission operations
 */
export function useFormSubmission<T, R>({
  mutationFn,
  queryKey,
  onSuccess,
  onError,
  successMessage = "Thao tác thành công",
  errorMessage = "Thao tác thất bại",
  transform,
}: UseFormSubmissionOptions<T, R>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      toastUtils.success(successMessage);
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      toastUtils.error(errorMessage);
      console.error("Form submission error:", error);
      onError?.(error);
    },
  });

  const submitForm = useCallback(
    async (data: T): Promise<{ success: boolean; result?: R; error?: any }> => {
      setIsSubmitting(true);

      try {
        const result = await FormService.submitForm(data, mutationFn, {
          onSuccess,
          onError,
          transform,
        });

        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mutationFn, onSuccess, onError, transform],
  );

  const submitWithMutation = useCallback(
    (data: T) => {
      const transformedData = transform ? transform(data) : data;
      return mutation.mutate(transformedData);
    },
    [mutation, transform],
  );

  return {
    submitForm,
    submitWithMutation,
    isSubmitting: isSubmitting || mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
