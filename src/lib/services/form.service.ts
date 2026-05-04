/**
 * Form Service - Handles form validation and submission orchestration
 * Follows SRP by focusing only on form-related business logic
 */
export class FormService {
  /**
   * Generic form validation
   */
  static validateForm<T extends Record<string, any>>(
    data: T,
    validationRules: Record<string, ((value: any) => string | null)[]>,
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = data[field];

      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate single field
   */
  static validateField(
    value: any,
    rules: ((value: any) => string | null)[],
  ): string | null {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        return error;
      }
    }
    return null;
  }

  /**
   * Common validation rules
   */
  static validationRules = {
    required:
      (message = "Trường này là bắt buộc") =>
      (value: any) => {
        if (value === null || value === undefined || value === "") {
          return message;
        }
        return null;
      },

    email:
      (message = "Định dạng email không hợp lệ") =>
      (value: string) => {
        if (!value) return null; // Let required rule handle empty values
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : message;
      },

    minLength: (min: number, message?: string) => (value: string) => {
      if (!value) return null; // Let required rule handle empty values
      return value.length >= min
        ? null
        : message || `Phải có ít nhất ${min} ký tự`;
    },

    maxLength: (max: number, message?: string) => (value: string) => {
      if (!value) return null;
      return value.length <= max
        ? null
        : message || `Không được vượt quá ${max} ký tự`;
    },

    fileSize: (maxSizeInMB: number, message?: string) => (file: File) => {
      if (!file) return null;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      return file.size <= maxSizeInBytes
        ? null
        : message || `Dung lượng file phải nhỏ hơn ${maxSizeInMB}MB`;
    },

    fileType: (allowedTypes: string[], message?: string) => (file: File) => {
      if (!file) return null;
      return allowedTypes.includes(file.type)
        ? null
        : message || `Định dạng file phải là: ${allowedTypes.join(", ")}`;
    },
  };

  /**
   * Transform form data before submission
   */
  static transformFormData<T, R>(data: T, transformer: (data: T) => R): R {
    return transformer(data);
  }

  /**
   * Handle form submission with error handling
   */
  static async submitForm<T, R>(
    data: T,
    submitFn: (data: T) => Promise<R>,
    options: {
      onSuccess?: (result: R) => void;
      onError?: (error: any) => void;
      transform?: (data: T) => T;
    } = {},
  ): Promise<{ success: boolean; result?: R; error?: any }> {
    try {
      const transformedData = options.transform
        ? options.transform(data)
        : data;
      const result = await submitFn(transformedData);

      options.onSuccess?.(result);

      return { success: true, result };
    } catch (error) {
      options.onError?.(error);
      return { success: false, error };
    }
  }
}
