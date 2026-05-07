"use client";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";
import { SLATriggerFormContent } from "../forms/SLATriggerFormContent";
import type { SLATrigger, CreateSLATriggerData } from "@/types/sla";

interface CreateSLATriggerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: SLATrigger) => void;
}

export function CreateSLATriggerDialog({
  isOpen,
  onClose,
  onSave,
}: CreateSLATriggerDialogProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleNumberChange,
    handleReset,
    handleSubmit,
  } = useEntityForm<CreateSLATriggerData>({
    initialData: {
      name: "",
      type: "",
      condition: "",
      threshold: 0,
      unit: "",
    },
    mutationFn: async (data: CreateSLATriggerData) => {
      const newTrigger: SLATrigger = {
        ...data,
        id: Date.now().toString(),
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      onSave(newTrigger);
      return newTrigger;
    },
    queryKey: ["sla-triggers"],
    onSuccess: () => {
      onClose();
    },
    successMessage: "Tạo SLA Trigger thành công",
    errorMessage: "Không thể tạo SLA Trigger",
    validationRules: {
      name: [validators.required("Tên trigger")],
      type: [validators.required("Loại trigger")],
      condition: [validators.required("Điều kiện")],
      threshold: [validators.required("Ngưỡng"), validators.numeric("Ngưỡng")],
      unit: [validators.required("Đơn vị")],
    },
    validateOnChange: true,
  });

  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Tạo SLA Trigger mới"
      maxWidth="sm"
    >
      <SLATriggerFormContent
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        mode="create"
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
