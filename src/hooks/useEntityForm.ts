import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent } from "react";
import type { ValidationRule } from "@/lib/validators/form-validators";

export interface UseEntityFormOptions<T> {
  initialData: T;
  validationRules?: Partial<Record<keyof T, ValidationRule | ValidationRule[]>>;
  mutationFn?: (data: T) => Promise<any>;
  queryKey?: string[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  validateOnChange?: boolean;
}

export function useEntityForm<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  mutationFn,
  queryKey,
  onSuccess,
  onError,
  validateOnChange = false,
}: UseEntityFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        const validator = validationRules[field];
        const rules = Array.isArray(validator)
          ? validator
          : validator
            ? [validator]
            : [];
        const error = rules.map((rule) => rule(value)).find(Boolean) ?? null;
        setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
      } else if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors, validateOnChange, validationRules],
  );

  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const validator = validationRules[field];
      const rules = Array.isArray(validator)
        ? validator
        : validator
          ? [validator]
          : [];

      for (const rule of rules) {
        const error = rule(value);
        if (error) return error;
      }

      return null;
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
    async (arg?: FormEvent | ((data: T) => Promise<any>), queryKeysToInvalidate: string[][] = []) => {
      if (arg && typeof arg !== "function") {
        arg.preventDefault();
      }

      if (!validateForm()) {
        return;
      }

      const submitFn = typeof arg === "function" ? arg : mutationFn;
      if (!submitFn) return;

      setIsSubmitting(true);
      try {
        const result = await submitFn(formData);

        // Invalidate queries
        if (queryKey) {
          queryClient.invalidateQueries({ queryKey });
        }
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
    [formData, mutationFn, queryKey, validateForm, queryClient, onSuccess, onError],
  );

  const handleInputChange = useCallback(
    (field: keyof T) => (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    },
    [updateField],
  );

  const handleSelectChange = useCallback(
    (field: keyof T) => (value: string) => {
      updateField(field, value);
    },
    [updateField],
  );

  const handleNumberChange = useCallback(
    (field: keyof T) => (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, Number(event.target.value));
    },
    [updateField],
  );

  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    isLoading: isSubmitting,
    isSubmitting,
    updateField,
    validateField,
    validateForm,
    handleInputChange,
    handleSelectChange,
    handleNumberChange,
    handleSubmit,
    handleReset,
  };
}
