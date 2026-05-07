"use client";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onReset?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  showReset?: boolean;
  showCancel?: boolean;
}

export function FormActions({
  onReset,
  onCancel,
  submitLabel = "Thực hiện",
  resetLabel = "Đặt lại",
  cancelLabel = "Hủy",
  isLoading = false,
  showReset = true,
  showCancel = true,
}: FormActionsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        type="submit"
        loading={isLoading}
        className="flex-1 bg-primary hover:bg-primary/90"
      >
        {submitLabel}
      </Button>
      {showReset && onReset && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="flex-1"
          disabled={isLoading}
        >
          {resetLabel}
        </Button>
      )}
      {showCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}
