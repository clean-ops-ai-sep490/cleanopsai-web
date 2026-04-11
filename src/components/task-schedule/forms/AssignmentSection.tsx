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

interface AssignmentSectionProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
}

// Mock data - replace with actual API calls
const mockWorkers = [
  { value: "worker-1", label: "Nguyễn Văn A" },
  { value: "worker-2", label: "Trần Thị B" },
  { value: "worker-3", label: "Lê Văn C" },
];

export function AssignmentSection({
  register,
  setValue,
  errors,
}: AssignmentSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Phân công nhân viên
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Người thực hiện *</Label>
            <Select onValueChange={(value) => setValue("assigneeId", value)}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkers.map((worker) => (
                  <SelectItem key={worker.value} value={worker.value}>
                    {worker.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeId && (
              <p className="text-sm text-red-500">
                {errors.assigneeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeName">Tên người thực hiện *</Label>
            <Input
              id="assigneeName"
              {...register("assigneeName")}
              placeholder="Tên sẽ được tự động điền"
              className="bg-gray-50 border-[#e5e5e5]"
              readOnly
            />
            {errors.assigneeName && (
              <p className="text-sm text-red-500">
                {errors.assigneeName.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
