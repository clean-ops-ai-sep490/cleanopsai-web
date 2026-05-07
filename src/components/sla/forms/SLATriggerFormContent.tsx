"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions } from "@/components/ui/form-actions";
import type { CreateSLATriggerData } from "@/types/sla";

interface SLATriggerFormContentProps {
  formData: CreateSLATriggerData;
  errors: Record<string, string>;
  isLoading: boolean;
  mode: "create" | "edit";
  onInputChange: (
    field: keyof CreateSLATriggerData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (
    field: keyof CreateSLATriggerData,
  ) => (value: string) => void;
  onNumberChange: (
    field: keyof CreateSLATriggerData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onCancel: () => void;
}

export function SLATriggerFormContent({
  formData,
  errors,
  isLoading,
  mode,
  onInputChange,
  onSelectChange,
  onNumberChange,
  onSubmit,
  onReset,
  onCancel,
}: SLATriggerFormContentProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên Trigger *</Label>
        <Input
          id="name"
          placeholder="Nhập tên trigger"
          value={formData.name}
          onChange={onInputChange("name")}
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Loại Trigger *</Label>
        <Select value={formData.type} onValueChange={onSelectChange("type")}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Response Time">Thời gian phản hồi</SelectItem>
            <SelectItem value="Resolution Time">
              Thời gian giải quyết
            </SelectItem>
            <SelectItem value="Quality Score">Điểm chất lượng</SelectItem>
            <SelectItem value="Customer Satisfaction">
              Sự hài lòng khách hàng
            </SelectItem>
            <SelectItem value="First Contact Resolution">
              Giải quyết lần đầu
            </SelectItem>
            <SelectItem value="Escalation Rate">Tỷ lệ leo thang</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="condition">Điều kiện *</Label>
          <Select
            value={formData.condition}
            onValueChange={onSelectChange("condition")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn điều kiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Greater than">Lớn hơn</SelectItem>
              <SelectItem value="Less than">Nhỏ hơn</SelectItem>
              <SelectItem value="Equal to">Bằng</SelectItem>
              <SelectItem value="Greater than or equal">
                Lớn hơn hoặc bằng
              </SelectItem>
              <SelectItem value="Less than or equal">
                Nhỏ hơn hoặc bằng
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-sm text-red-600">{errors.condition}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="threshold">Ngưỡng *</Label>
          <Input
            id="threshold"
            type="number"
            placeholder="0"
            value={formData.threshold}
            onChange={onNumberChange("threshold")}
            required
          />
          {errors.threshold && (
            <p className="text-sm text-red-600">{errors.threshold}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Đơn vị *</Label>
        <Select value={formData.unit} onValueChange={onSelectChange("unit")}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn đơn vị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Giây</SelectItem>
            <SelectItem value="minutes">Phút</SelectItem>
            <SelectItem value="hours">Giờ</SelectItem>
            <SelectItem value="days">Ngày</SelectItem>
            <SelectItem value="percentage">Phần trăm</SelectItem>
            <SelectItem value="count">Số lượng</SelectItem>
          </SelectContent>
        </Select>
        {errors.unit && <p className="text-sm text-red-600">{errors.unit}</p>}
      </div>

      <FormActions
        onReset={onReset}
        onCancel={onCancel}
        submitLabel={mode === "create" ? "Tạo Trigger" : "Lưu thay đổi"}
        isLoading={isLoading}
        showReset={true}
        showCancel={true}
      />
    </form>
  );
}
