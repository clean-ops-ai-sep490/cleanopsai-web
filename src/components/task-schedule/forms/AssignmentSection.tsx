"use client";

import { useMemo } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
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
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

export function AssignmentSection({
  register,
  setValue,
  watch,
  errors,
}: AssignmentSectionProps) {
  // Watch form values to get context
  const sopId = watch("sopId");
  const slaId = watch("slaId");
  const slaShiftId = watch("slaShiftId");
  const locationAddress = watch("locationAddress"); // Lấy address từ form thay vì API call

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
    locationAddress: locationAddress, // Sử dụng address từ form
    enabled: true,
  });

  // Handle worker selection
  const handleWorkerSelect = (workerId: string) => {
    const selectedWorker = selectWorker(workerId);
    if (selectedWorker) {
      setValue("assigneeId", workerId);
      setValue("assigneeName", selectedWorker.fullName);
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
              <Select onValueChange={handleWorkerSelect}>
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

              {/* Hidden fields for form submission */}
              <input type="hidden" {...register("assigneeId")} />

              {errors.assigneeId && (
                <p className="text-sm text-red-500">Vui lòng chọn nhân viên</p>
              )}
              {errors.assigneeName && (
                <p className="text-sm text-red-500">
                  {(errors.assigneeName as any)?.message ||
                    "Trường này là bắt buộc"}
                </p>
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
                Lỗi khi tải danh sách nhân viên: {workersError.message}
              </div>
            )}
          </div>

          {/* Supervisor Selection */}
          <div className="space-y-2">
            <Label>Người giám sát *</Label>
            <Select onValueChange={(value) => setValue("supervisorId", value)}>
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
              <p className="text-sm text-red-500">
                {(errors.supervisorId as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
