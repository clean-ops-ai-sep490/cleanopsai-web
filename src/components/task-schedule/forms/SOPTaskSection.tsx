"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSOPs } from "@/hooks/useSOPs";
import { useSLAQuery } from "@/hooks/useSLAQuery";
import { getSLAShiftsBySLA, getSLATasksBySLA } from "@/lib/sla-api";
import { getSOPById } from "@/lib/sop-api";
import { useQuery } from "@tanstack/react-query";
import type { SLA, SLAShift, SLATask } from "@/types/sla";
import type { SOP } from "@/types/sop";

interface SOPTaskSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
  onAutoFill?: (data: {
    sop?: SOP;
    sla?: SLA;
    slaShift?: SLAShift;
    slaTask?: SLATask;
  }) => void;
}

export function SOPTaskSection({
  formData,
  errors,
  updateField,
  onAutoFill,
}: SOPTaskSectionProps) {
  // Use state only for tracking internal selection if needed, 
  // but better to use formData directly for consistency.
  const selectedSlaId = formData.slaId;
  const selectedSopId = formData.sopId;
  const selectedSlaShiftId = formData.slaShiftId;
  const selectedSlaTaskId = formData.slaTaskId;

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

  // Fetch SOP details when selected
  const { data: selectedSop } = useQuery({
    queryKey: ["sop", selectedSopId],
    queryFn: () => getSOPById(selectedSopId),
    enabled: !!selectedSopId,
  });

  // Get selected SLA, SLA Shift, and SLA Task objects
  const selectedSla = slas.find((sla) => sla.id === selectedSlaId);
  const selectedSlaShift = slaShifts.find(
    (shift) => shift.id === selectedSlaShiftId,
  );
  const selectedSlaTask = slaTasks.find(
    (task) => task.id === selectedSlaTaskId,
  );

  // Auto-fill form when all required selections are made
  useEffect(() => {
    if (selectedSop && selectedSla && selectedSlaShift && selectedSlaTask) {
      // Call the callback to notify parent component
      if (onAutoFill) {
        onAutoFill({
          sop: selectedSop,
          sla: selectedSla,
          slaShift: selectedSlaShift,
          slaTask: selectedSlaTask,
        });
      }
    }
  }, [selectedSop, selectedSla, selectedSlaShift, selectedSlaTask, onAutoFill]);

  const handleSlaChange = (slaId: string) => {
    updateField("slaId", slaId);
    // Reset dependent fields when SLA changes
    updateField("slaShiftId", "");
    updateField("slaTaskId", "");
  };

  const handleSopChange = (sopId: string) => {
    updateField("sopId", sopId);
  };

  const handleSlaShiftChange = (shiftId: string) => {
    updateField("slaShiftId", shiftId);
  };

  const handleSlaTaskChange = (taskId: string) => {
    updateField("slaTaskId", taskId);
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
            <Select onValueChange={handleSopChange} value={selectedSopId || ""}>
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
              <p className="text-sm text-red-500">{errors.sopId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA *</Label>
            <Select onValueChange={handleSlaChange} value={selectedSlaId || ""}>
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
              <p className="text-sm text-red-500">{errors.slaId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ca làm việc *</Label>
            <Select
              onValueChange={handleSlaShiftChange}
              value={selectedSlaShiftId || ""}
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
              <p className="text-sm text-red-500">{errors.slaShiftId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>SLA Task *</Label>
            <Select
              onValueChange={handleSlaTaskChange}
              value={selectedSlaTaskId || ""}
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
              <p className="text-sm text-red-500">{errors.slaTaskId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
