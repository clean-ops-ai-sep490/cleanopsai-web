import type { WorkAreaTask } from "@/types/sla";

export interface ValidationError {
  field: string;
  message: string;
}

export interface WorkAreaFormData {
  name: string;
  zoneId: string;
  area: number;
  description: string;
  tasks: WorkAreaTask[];
}

export function validateWorkArea(
  workArea: WorkAreaFormData,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!workArea.name.trim()) {
    errors.push({
      field: "name",
      message: "Tên khu vực làm việc là bắt buộc",
    });
  }

  if (!workArea.zoneId) {
    errors.push({
      field: "zoneId",
      message: "Vui lòng chọn khu vực",
    });
  }

  if (workArea.area <= 0) {
    errors.push({
      field: "area",
      message: "Diện tích phải lớn hơn 0",
    });
  }

  // Validate tasks
  workArea.tasks.forEach((task, index) => {
    if (!task.name.trim()) {
      errors.push({
        field: `tasks.${index}.name`,
        message: `Tên công việc ${index + 1} là bắt buộc`,
      });
    }

    if (!task.frequency) {
      errors.push({
        field: `tasks.${index}.frequency`,
        message: `Tần suất cho công việc ${index + 1} là bắt buộc`,
      });
    } else {
      const { daily, weekly, monthly, yearly } = task.frequency;
      if (!daily && !weekly && !monthly && !yearly) {
        errors.push({
          field: `tasks.${index}.frequency`,
          message: `Phải chọn ít nhất một tần suất cho công việc ${index + 1}`,
        });
      }
    }
  });

  return errors;
}

export function isWorkAreaValid(workArea: WorkAreaFormData): boolean {
  return validateWorkArea(workArea).length === 0;
}
