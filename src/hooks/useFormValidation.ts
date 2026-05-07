import { useCallback } from "react";
import { FormService } from "@/lib/services/form.service";

/**
 * Form Validation Hook - Handles only validation logic
 * Follows SRP by focusing only on validation operations
 */
export function useFormValidation<T extends Record<string, any>>(
  validationRules: Record<string, ((value: any) => string | null)[]> = {},
) {
  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const rules = validationRules[String(field)];
      if (!rules) return null;

      return FormService.validateField(value, rules);
    },
    [validationRules],
  );

  const validateForm = useCallback(
    (data: T): { isValid: boolean; errors: Record<string, string> } => {
      return FormService.validateForm(data, validationRules);
    },
    [validationRules],
  );

  const validateFields = useCallback(
    (data: T, fields: (keyof T)[]): Record<string, string> => {
      const errors: Record<string, string> = {};

      fields.forEach((field) => {
        const error = validateField(field, data[field]);
        if (error) {
          errors[String(field)] = error;
        }
      });

      return errors;
    },
    [validateField],
  );

  return {
    validateField,
    validateForm,
    validateFields,
  };
}
