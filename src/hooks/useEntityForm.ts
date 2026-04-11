import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UseEntityFormOptions<T> {
  initialData: T;
  mutationFn: (data: T) => Promise<any>;
  queryKey: string[];
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  validationRules?: Record<string, ((value: any) => string | null)[]>;
  successMessage?: string;
  errorMessage?: string;
  validateOnChange?: boolean;
}

export interface UseEntityFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<string, string>;
  isLoading: boolean;
  isValid: boolean;
  handleInputChange: (
    field: keyof T,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof T) => (value: string) => void;
  handleNumberChange: (
    field: keyof T,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

/**
 * Generic form hook for entity CRUD operations
 * Eliminates duplicate form logic across components
 */
export function useEntityForm<T extends Record<string, any>>(
  options: UseEntityFormOptions<T>,
): UseEntityFormReturn<T> {
  const {
    initialData,
    mutationFn,
    queryKey,
    onSuccess,
    onError,
    validationRules = {},
    successMessage = "Thao tác thành công",
    errorMessage = "Thao tác thất bại",
    validateOnChange = false,
  } = options;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Mutation for form submission
  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(errorMessage);
      console.error("Form submission error:", error);
      onError?.(error);
    },
  });

  // Validate single field
  const validateField = useCallback(
    (field: keyof T) => {
      const fieldKey = String(field);
      const fieldRules = validationRules[fieldKey];
      if (!fieldRules) return;

      const fieldValue = formData[field];
      let fieldError: string | null = null;

      for (const rule of fieldRules) {
        fieldError = rule(fieldValue);
        if (fieldError) break;
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors[fieldKey] = fieldError;
        } else {
          delete newErrors[fieldKey];
        }
        return newErrors;
      });
    },
    [formData, validationRules],
  );

  // Validate entire form
  const validateFormData = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach((fieldKey) => {
      const fieldRules = validationRules[fieldKey];
      if (!fieldRules) return;

      const fieldValue = formData[fieldKey as keyof T];

      for (const rule of fieldRules) {
        const error = rule(fieldValue);
        if (error) {
          newErrors[fieldKey] = error;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validationRules]);

  // Handle input change for text inputs
  const handleInputChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (validateOnChange) {
          // Clear error for this field first
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[String(field)];
            return newErrors;
          });
          // Validate after state update
          setTimeout(() => validateField(field), 0);
        }
      },
    [validateOnChange, validateField],
  );

  // Handle select change
  const handleSelectChange = useCallback(
    (field: keyof T) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[String(field)];
          return newErrors;
        });
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField],
  );

  // Handle number input change
  const handleNumberChange = useCallback(
    (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[String(field)];
          return newErrors;
        });
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField],
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[String(field)];
          return newErrors;
        });
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField],
  );

  // Reset form to initial state
  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      const isValid = validateFormData();

      if (!isValid) {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey && errors[firstErrorKey]) {
          toast.error(errors[firstErrorKey]);
        }
        return;
      }

      mutation.mutate(formData);
    },
    [formData, validateFormData, errors, mutation],
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    setFormData,
    errors,
    isLoading: mutation.isPending,
    isValid,
    handleInputChange,
    handleSelectChange,
    handleNumberChange,
    handleReset,
    handleSubmit,
    validateField,
    validateForm: validateFormData,
    clearErrors,
    setFieldValue,
  };
}
