"use client";

import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface StatusSectionProps {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function StatusSection({ setValue, watch }: StatusSectionProps) {
  const isActive = watch("isActive");

  const handleToggle = () => {
    setValue("isActive", !isActive);
  };

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
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a80a2] focus:ring-offset-2 ${
          isActive ? "bg-[#1a80a2]" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
