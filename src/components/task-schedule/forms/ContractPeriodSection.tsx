"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContractPeriodSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
}

export function ContractPeriodSection({
  formData,
  errors,
  updateField,
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
              value={formData.contractStartDate || ""}
              onChange={(e) => updateField("contractStartDate", e.target.value)}
              className="bg-white border-[#e5e5e5]"
            />
            {errors.contractStartDate && (
              <p className="text-sm text-red-500">
                {errors.contractStartDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Ngày kết thúc *</Label>
            <Input
              id="contractEndDate"
              type="date"
              value={formData.contractEndDate || ""}
              onChange={(e) => updateField("contractEndDate", e.target.value)}
              className="bg-white border-[#e5e5e5]"
            />
            {errors.contractEndDate && (
              <p className="text-sm text-red-500">
                {errors.contractEndDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
