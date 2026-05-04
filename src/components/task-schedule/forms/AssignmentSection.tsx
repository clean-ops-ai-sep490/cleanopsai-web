"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";
import { useAllSupervisors } from "@/hooks/useSupervisors";
import { useTaskScheduleWorkers } from "@/hooks/useTaskScheduleWorkers";
import { getSLAShiftsBySLA } from "@/lib/sla-api";
import { useQuery } from "@tanstack/react-query";

interface AssignmentSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
}

export function AssignmentSection({
  formData,
  errors,
  updateField,
}: AssignmentSectionProps) {
  // Use form values from props
  const sopId = formData.sopId;
  const slaId = formData.slaId;
  const slaShiftId = formData.slaShiftId;
  const locationAddress = formData.locationAddress;

  // Fetch supervisors from API
  const { data: supervisorsData, isLoading: supervisorsLoading } =
    useAllSupervisors();
  const supervisors = supervisorsData || [];

  // Get SLA Shift details to extract time range
  const { data: slaShifts = [] } = useQuery({
    queryKey: ["slaShifts", slaId],
    queryFn: () => getSLAShiftsBySLA(slaId),
    enabled: !!slaId,
  });

  // Find selected shift details
  const selectedShift = useMemo(() => {
    return slaShifts.find((shift) => shift.id === slaShiftId);
  }, [slaShifts, slaShiftId]);

  // Use simplified worker filter for task schedule
  const {
    workers,
    isLoading: workersLoading,
    error: workersError,
    selectWorker,
  } = useTaskScheduleWorkers({
    sopId,
    slaShiftStartTime: selectedShift?.startTime,
    slaShiftEndTime: selectedShift?.endTime,
    locationAddress: locationAddress,
    enabled: true,
  });

  // Handle worker selection
  const handleWorkerSelect = (workerId: string) => {
    const selectedWorker = selectWorker(workerId);
    if (selectedWorker) {
      updateField("assigneeId", workerId);
      updateField("assigneeName", selectedWorker.fullName);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Phân công nhân viên
        </h2>

        {/* Assignment Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Worker Selection */}
          <div className="space-y-4">
            {/* Worker Selection Dropdown */}
            <div className="space-y-2">
              <Label>Người thực hiện *</Label>
              <Select 
                value={formData.assigneeId}
                onValueChange={handleWorkerSelect}
              >
                <SelectTrigger className="bg-white border-[#e5e5e5]">
                  <SelectValue
                    placeholder={
                      !sopId && !slaShiftId && !locationAddress
                        ? "Chọn nhân viên"
                        : workersLoading
                          ? "Đang tìm nhân viên phù hợp..."
                          : workers.length === 0
                            ? "Không có nhân viên phù hợp với yêu cầu"
                            : "Chọn nhân viên"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{worker.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {worker.displayAddress}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.assigneeId && (
                <p className="text-sm text-red-500">{errors.assigneeId}</p>
              )}
            </div>

            {/* Worker Info Display */}
            {workers.length > 0 && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border">
                <div className="font-medium mb-1">
                  Tìm thấy {workers.length} nhân viên phù hợp
                </div>
                <div className="text-xs">
                  {sopId && "• Có kỹ năng/chứng chỉ theo SOP"}
                  {selectedShift &&
                    ` • Rảnh trong khung giờ ${selectedShift.startTime}-${selectedShift.endTime}`}
                  {locationAddress && ` • Gần địa chỉ "${locationAddress}"`}
                </div>
              </div>
            )}

            {workersError && (
              <div className="text-sm text-red-500 p-3 border border-red-200 rounded bg-red-50">
                Lỗi khi tải danh sách nhân viên: {(workersError as any).message}
              </div>
            )}
          </div>

          {/* Supervisor Selection */}
          <div className="space-y-2">
            <Label>Người giám sát *</Label>
            <Select 
              value={formData.supervisorId}
              onValueChange={(value) => updateField("supervisorId", value)}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    supervisorsLoading ? "Đang tải..." : "Chọn người giám sát"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{supervisor.fullName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supervisorId && (
              <p className="text-sm text-red-500">{errors.supervisorId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
