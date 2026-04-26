"use client";

import { useEffect } from "react";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";
import { SLATriggerFormContent } from "../forms/SLATriggerFormContent";
import type { SLATrigger, CreateSLATriggerData } from "@/types/sla";

interface EditSLATriggerDialogProps {
  trigger: SLATrigger;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: SLATrigger) => void;
}

export function EditSLATriggerDialog({
  trigger,
  isOpen,
  onClose,
  onSave,
}: EditSLATriggerDialogProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleNumberChange,
    handleReset,
    handleSubmit,
    setFormData,
  } = useEntityForm<CreateSLATriggerData>({
    initialData: {
      name: trigger.name,
      type: trigger.type,
      condition: trigger.condition,
      threshold: trigger.threshold,
      unit: trigger.unit,
    },
    mutationFn: async (data: CreateSLATriggerData) => {
      const updatedTrigger: SLATrigger = {
        ...trigger,
        ...data,
      };
      onSave(updatedTrigger);
      return updatedTrigger;
    },
    queryKey: ["sla-triggers"],
    onSuccess: () => {
      onClose();
    },
    successMessage: "Cập nhật SLA Trigger thành công",
    errorMessage: "Không thể cập nhật SLA Trigger",
    validationRules: {
      name: [validators.required("Tên trigger")],
      type: [validators.required("Loại trigger")],
      condition: [validators.required("Điều kiện")],
      threshold: [validators.required("Ngưỡng"), validators.numeric("Ngưỡng")],
      unit: [validators.required("Đơn vị")],
    },
    validateOnChange: true,
  });

  // Update form data when trigger prop changes
  useEffect(() => {
    setFormData({
      name: trigger.name,
      type: trigger.type,
      condition: trigger.condition,
      threshold: trigger.threshold,
      unit: trigger.unit,
    });
  }, [trigger, setFormData]);

  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Chỉnh sửa SLA Trigger"
      maxWidth="sm"
    >
      <SLATriggerFormContent
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        mode="edit"
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onNumberChange={handleNumberChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={onClose}
      />
    </StandardDialog>
  );
}
