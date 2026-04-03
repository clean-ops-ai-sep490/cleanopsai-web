"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "@/components/ui/form-actions";
import { toast } from "sonner";

interface ZoneFormData {
  name: string;
  description: string;
}

interface ZoneFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ZoneForm({ onSuccess, onCancel }: ZoneFormProps) {
  const [formData, setFormData] = useState<ZoneFormData>({
    name: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Mock mutation - replace with actual API call
  const createZoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast.success("Zone created successfully");
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create zone");
      console.error("Zone creation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tên zone là bắt buộc");
      return;
    }

    createZoneMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof ZoneFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

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
      </div>

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Thêm Zone"
        cancelLabel="Hủy"
        isLoading={createZoneMutation.isPending}
      />
    </form>
  );
}
