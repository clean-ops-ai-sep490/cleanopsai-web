"use client";

import { useState } from "react";
import { UseFormSetValue, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSOPs } from "@/hooks/useWorkflowBuilder";
import { useSLAQuery } from "@/hooks/useSLAQuery";
import { getSLAShiftsBySLA, getSLATasksBySLA } from "@/lib/sla-api";
import { useQuery } from "@tanstack/react-query";

interface SOPTaskSectionProps {
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
}

export function SOPTaskSection({ setValue, errors }: SOPTaskSectionProps) {
  const [selectedSlaId, setSelectedSlaId] = useState<string>("");

  // Fetch SOPs from API
  const { data: sopsData, isLoading: sopsLoading } = useSOPs();
  const sops = sopsData?.content || [];

  // Fetch all SLAs
  const { data: slaData, isLoading: slaLoading } = useSLAQuery();
  const slas = slaData?.slas || [];

  // Fetch SLA Shifts based on selected SLA
  const { data: slaShifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["slaShifts", selectedSlaId],
    queryFn: () => getSLAShiftsBySLA(selectedSlaId),
    enabled: !!selectedSlaId,
  });

  // Fetch SLA Tasks based on selected SLA
  const { data: slaTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["slaTasks", selectedSlaId],
    queryFn: () => getSLATasksBySLA(selectedSlaId),
    enabled: !!selectedSlaId,
  });

  const handleSlaChange = (slaId: string) => {
    setSelectedSlaId(slaId);
    setValue("slaId", slaId);
    // Reset dependent fields when SLA changes
    setValue("slaShiftId", "");
    setValue("slaTaskId", "");
  };

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
                <SelectValue
                  placeholder={sopsLoading ? "Đang tải..." : "Chọn SOP"}
                />
              </SelectTrigger>
              <SelectContent>
                {sops.map((sop) => (
                  <SelectItem key={sop.id} value={sop.id}>
                    {sop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sopId && (
              <p className="text-sm text-red-500">
                {(errors.sopId as any)?.message || "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA *</Label>
            <Select onValueChange={handleSlaChange}>
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={slaLoading ? "Đang tải..." : "Chọn SLA"}
                />
              </SelectTrigger>
              <SelectContent>
                {slas.map((sla) => (
                  <SelectItem key={sla.id} value={sla.id}>
                    {sla.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.slaId && (
              <p className="text-sm text-red-500">
                {(errors.slaId as any)?.message || "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ca làm việc *</Label>
            <Select
              onValueChange={(value) => setValue("slaShiftId", value)}
              disabled={!selectedSlaId}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !selectedSlaId
                      ? "Chọn SLA trước"
                      : shiftsLoading
                        ? "Đang tải..."
                        : "Chọn ca làm việc"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {slaShifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.slaShiftId && (
              <p className="text-sm text-red-500">
                {(errors.slaShiftId as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA Task *</Label>
            <Select
              onValueChange={(value) => setValue("slaTaskId", value)}
              disabled={!selectedSlaId}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !selectedSlaId
                      ? "Chọn SLA trước"
                      : tasksLoading
                        ? "Đang tải..."
                        : "Chọn SLA Task"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {slaTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.slaTaskId && (
              <p className="text-sm text-red-500">
                {(errors.slaTaskId as any)?.message || "Trường này là bắt buộc"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
