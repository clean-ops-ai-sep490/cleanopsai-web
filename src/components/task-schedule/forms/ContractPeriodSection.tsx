"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContractPeriodSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function ContractPeriodSection({
  register,
  errors,
}: ContractPeriodSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Thời gian hợp đồng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contractStartDate">Ngày bắt đầu *</Label>
            <Input
              id="contractStartDate"
              type="date"
              {...register("contractStartDate")}
              className="bg-white border-[#e5e5e5]"
            />
            {errors.contractStartDate && (
              <p className="text-sm text-red-500">
                {errors.contractStartDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Ngày kết thúc *</Label>
            <Input
              id="contractEndDate"
              type="date"
              {...register("contractEndDate")}
              className="bg-white border-[#e5e5e5]"
            />
            {errors.contractEndDate && (
              <p className="text-sm text-red-500">
                {errors.contractEndDate.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
