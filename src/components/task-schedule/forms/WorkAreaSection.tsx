"use client";

import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkAreaSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
}

// Mock data - replace with actual API calls
const mockWorkAreas = [
  { value: "area-1", label: "Tầng 1 - Sảnh chính" },
  { value: "area-2", label: "Tầng 2 - Văn phòng" },
  { value: "area-3", label: "Tầng 3 - Phòng họp" },
];

const mockWorkAreaDetails = [
  { value: "detail-1", label: "Khu vực A1" },
  { value: "detail-2", label: "Khu vực A2" },
  { value: "detail-3", label: "Khu vực B1" },
];

export function WorkAreaSection({
  register,
  setValue,
  errors,
}: WorkAreaSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình khu vực
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Khu vực làm việc *</Label>
            <Select onValueChange={(value) => setValue("workAreaId", value)}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkAreas.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workAreaId && (
              <p className="text-sm text-red-500">
                {errors.workAreaId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Chi tiết khu vực *</Label>
            <Select
              onValueChange={(value) => setValue("workAreaDetailId", value)}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn chi tiết khu vực" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkAreaDetails.map((detail) => (
                  <SelectItem key={detail.value} value={detail.value}>
                    {detail.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workAreaDetailId && (
              <p className="text-sm text-red-500">
                {errors.workAreaDetailId.message}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="displayLocation">Địa điểm hiển thị *</Label>
            <Input
              id="displayLocation"
              {...register("displayLocation")}
              placeholder="Nhập địa điểm hiển thị"
              className="bg-white border-[#e5e5e5]"
            />
            {errors.displayLocation && (
              <p className="text-sm text-red-500">
                {errors.displayLocation.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
