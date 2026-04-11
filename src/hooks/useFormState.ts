import { useState, useCallback } from "react";

/**
 * Form State Hook - Handles only form state management
 * Follows SRP by focusing only on state operations
 */
export function useFormState<T extends Record<string, any>>(initialData: T) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleInputChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFieldValue(field, e.target.value);
      },
    [setFieldValue],
  );

  const handleSelectChange = useCallback(
    (field: keyof T) => (value: string) => {
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const handleNumberChange = useCallback(
    (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === "" ? "" : Number(e.target.value);
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setFieldValue,
    handleInputChange,
    handleSelectChange,
    handleNumberChange,
    resetForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  };
}
