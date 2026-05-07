"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface BasicInfoSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
}

export function BasicInfoSection({
  formData,
  errors,
  updateField,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            {/* <Info className="w-4 h-4" />
            <span>
              Các trường sẽ tự động điền khi chọn SOP, SLA, SLA Shift và SLA Task
            </span> */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên lịch trình *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Sẽ tự động điền từ SOP và SLA Task"
              className="bg-white border-[#e5e5e5]"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes">
              Thời gian thực hiện (phút) *
            </Label>
            <Input
              id="durationMinutes"
              type="number"
              value={formData.durationMinutes || ""}
              onChange={(e) => updateField("durationMinutes", Number(e.target.value))}
              placeholder="Nhập thời gian thực hiện (phút)"
              className="bg-white border-[#e5e5e5]"
            />
            {errors.durationMinutes && (
              <p className="text-sm text-red-500">{errors.durationMinutes}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Sẽ tự động điền từ SOP"
            className="bg-white border-[#e5e5e5] min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
