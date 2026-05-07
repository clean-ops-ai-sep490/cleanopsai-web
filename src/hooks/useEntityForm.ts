import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseEntityFormOptions<T> {
  initialData: T;
  validationRules?: Record<keyof T, (value: any) => string | null>;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useEntityForm<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSuccess,
  onError,
}: UseEntityFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const validator = validationRules[field];
      return validator ? validator(value) : null;
    },
    [validationRules],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field as keyof T, formData[field]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationRules, validateField]);

  const handleSubmit = useCallback(
    async (
      submitFn: (data: T) => Promise<any>,
      queryKeysToInvalidate: string[][] = [],
    ) => {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await submitFn(formData);

        // Invalidate queries
        queryKeysToInvalidate.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });

        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, queryClient, onSuccess, onError],
  );

  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    handleReset,
  };
}
