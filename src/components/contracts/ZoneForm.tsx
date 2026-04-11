"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "@/components/ui/form-actions";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";

interface ZoneFormData {
  name: string;
  description: string;
}

interface ZoneFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ZoneForm({ onSuccess, onCancel }: ZoneFormProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleReset,
    handleSubmit,
  } = useEntityForm<ZoneFormData>({
    initialData: {
      name: "",
      description: "",
    },
    mutationFn: async (data: ZoneFormData) => {
      // Mock mutation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    queryKey: ["zones"],
    onSuccess,
    successMessage: "Zone created successfully",
    errorMessage: "Failed to create zone",
    validationRules: {
      name: [validators.required("Tên zone")],
    },
    validateOnChange: true,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zoneName">Tên zone *</Label>
        <Input
          id="zoneName"
          type="text"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="VD: Khu vực ngoài cảnh, Khu vực trong nhà..."
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="zoneDescription">Mô tả</Label>
        <Textarea
          id="zoneDescription"
          value={formData.description}
          onChange={handleInputChange("description")}
          placeholder="Mô tả chi tiết về zone"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Thêm Zone"
        cancelLabel="Hủy"
        isLoading={isLoading}
      />
    </form>
  );
}
