/**
 * Form validation utilities to eliminate duplicate validation logic
 */

export type ValidationRule<T = any> = (value: T) => string | null;

/**
 * Common validation rules
 */
export const validators = {
  /**
   * Check if field is required (not empty)
   */
  required:
    (fieldName: string): ValidationRule<string> =>
    (value: string) => {
      if (!value || value.trim() === "") {
        return `${fieldName} là bắt buộc`;
      }
      return null;
    },

  /**
   * Validate email format
   */
  email: (value: string) => {
    if (!value) return null; // Let required validator handle empty values

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Định dạng email không hợp lệ";
    }
    return null;
  },

  /**
   * Validate numeric values
   */
  numeric:
    (fieldName: string): ValidationRule<string | number> =>
    (value: string | number) => {
      if (!value && value !== 0) return null; // Let required validator handle empty values

      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        return `${fieldName} phải là số hợp lệ`;
      }
      return null;
    },

  /**
   * Validate minimum length
   */
  minLength:
    (min: number, fieldName: string): ValidationRule<string> =>
    (value: string) => {
      if (!value) return null; // Let required validator handle empty values

      if (value.length < min) {
        return `${fieldName} phải có ít nhất ${min} ký tự`;
      }
      return null;
    },

  /**
   * Validate maximum length
   */
  maxLength:
    (max: number, fieldName: string): ValidationRule<string> =>
    (value: string) => {
      if (!value) return null;

      if (value.length > max) {
        return `${fieldName} không được vượt quá ${max} ký tự`;
      }
      return null;
    },

  /**
   * Validate minimum value for numbers
   */
  minValue:
    (min: number, fieldName: string): ValidationRule<number> =>
    (value: number) => {
      if (value === null || value === undefined) return null;

      if (value < min) {
        return `${fieldName} phải lớn hơn hoặc bằng ${min}`;
      }
      return null;
    },

  /**
   * Validate maximum value for numbers
   */
  maxValue:
    (max: number, fieldName: string): ValidationRule<number> =>
    (value: number) => {
      if (value === null || value === undefined) return null;

      if (value > max) {
        return `${fieldName} phải nhỏ hơn hoặc bằng ${max}`;
      }
      return null;
    },

  /**
   * Custom validation rule
   */
  custom:
    (
      validationFn: (value: any) => boolean,
      errorMessage: string,
    ): ValidationRule =>
    (value: any) => {
      if (!validationFn(value)) {
        return errorMessage;
      }
      return null;
    },
};

/**
 * Validate form data against validation rules
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule[]>>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    if (!fieldRules) return;

    const fieldValue = data[field as keyof T];

    for (const rule of fieldRules) {
      const error = rule(fieldValue);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasValidationErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get first validation error message
 */
export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}
