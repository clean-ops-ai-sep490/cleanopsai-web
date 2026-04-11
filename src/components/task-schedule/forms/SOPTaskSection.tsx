"use client";

import { UseFormSetValue, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SOPTaskSectionProps {
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
}

// Mock data - replace with actual API calls
const mockSOPs = [
  { value: "sop-1", label: "SOP Vệ sinh văn phòng" },
  { value: "sop-2", label: "SOP Vệ sinh bệnh viện" },
  { value: "sop-3", label: "SOP Vệ sinh nhà máy" },
];

const mockSLATasks = [
  { value: "task-1", label: "Vệ sinh hàng ngày" },
  { value: "task-2", label: "Vệ sinh hàng tuần" },
  { value: "task-3", label: "Vệ sinh tổng quát" },
];

const mockSLAShifts = [
  { value: "shift-1", label: "Ca sáng (6:00 - 14:00)" },
  { value: "shift-2", label: "Ca chiều (14:00 - 22:00)" },
  { value: "shift-3", label: "Ca đêm (22:00 - 6:00)" },
];

export function SOPTaskSection({ setValue, errors }: SOPTaskSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình SOP & Task
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>SOP *</Label>
            <Select onValueChange={(value) => setValue("sopId", value)}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn SOP" />
              </SelectTrigger>
              <SelectContent>
                {mockSOPs.map((sop) => (
                  <SelectItem key={sop.value} value={sop.value}>
                    {sop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sopId && (
              <p className="text-sm text-red-500">{errors.sopId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA Task *</Label>
            <Select onValueChange={(value) => setValue("slaTaskId", value)}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn SLA Task" />
              </SelectTrigger>
              <SelectContent>
                {mockSLATasks.map((task) => (
                  <SelectItem key={task.value} value={task.value}>
                    {task.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.slaTaskId && (
              <p className="text-sm text-red-500">{errors.slaTaskId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA Shift *</Label>
            <Select onValueChange={(value) => setValue("slaShiftId", value)}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn ca làm việc" />
              </SelectTrigger>
              <SelectContent>
                {mockSLAShifts.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.slaShiftId && (
              <p className="text-sm text-red-500">
                {errors.slaShiftId.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
