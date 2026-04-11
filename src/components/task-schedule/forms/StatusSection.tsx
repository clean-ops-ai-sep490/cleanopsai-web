"use client";

import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface StatusSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
}

export function StatusSection({ register, setValue }: StatusSectionProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="isActive" className="text-base font-medium">
          Trạng thái hoạt động
        </Label>
        <p className="text-sm text-[#70808f] mt-1">
          Bật để kích hoạt lịch trình ngay sau khi tạo
        </p>
      </div>
      <Switch
        id="isActive"
        {...register("isActive")}
        onCheckedChange={(checked) => setValue("isActive", checked)}
      />
    </div>
  );
}
