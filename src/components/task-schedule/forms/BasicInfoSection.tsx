"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoData {
  name: string;
  description: string;
  durationMinutes: number;
}

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên lịch trình *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên lịch trình"
              className="bg-white border-[#e5e5e5]"
            />
            {errors.name && (
              <p className="text-sm text-red-500">
                {(errors.name as any)?.message || "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes">
              Thời gian thực hiện (phút) *
            </Label>
            <Input
              id="durationMinutes"
              type="number"
              {...register("durationMinutes", { valueAsNumber: true })}
              placeholder="60"
              className="bg-white border-[#e5e5e5]"
            />
            {errors.durationMinutes && (
              <p className="text-sm text-red-500">
                {(errors.durationMinutes as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Nhập mô tả lịch trình"
            className="bg-white border-[#e5e5e5] min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
