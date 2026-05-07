"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CreateTaskScheduleData, RecurrenceConfig, MonthDay } from "@/types/schedule";
import type { SLAShift, SLATask } from "@/types/sla";

// Import form sections
import { BasicInfoSection } from "./forms/BasicInfoSection";
import { SOPTaskSection } from "./forms/SOPTaskSection";
import { WorkAreaSection } from "./forms/WorkAreaSection";
import { AssignmentSection } from "./forms/AssignmentSection";
import { RecurrenceSection } from "./forms/RecurrenceSection";
import { StatusSection } from "./forms/StatusSection";
import { useQuery } from "@tanstack/react-query";
import { getContractById } from "@/lib/contract-api";
import { Info, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils/date-utils";
import { SectionCard } from "@/components/ui/section-card";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const normalizeTime = (time: string): string => {
  const parts = time.split(":");
  if (parts.length < 2) return "";
  const hour = parts[0].padStart(2, "0");
  const minute = parts[1].padStart(2, "0");
  return `${hour}:${minute}`;
};

const parseTimeToMinutes = (time: string): number | null => {
  const normalized = normalizeTime(time);
  if (!TIME_REGEX.test(normalized)) return null;
  const [h, m] = normalized.split(":").map(Number);
  return h * 60 + m;
};

const getShiftWindow = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return null;

  const startMinutes = parseTimeToMinutes(startTime.substring(0, 5));
  const endMinutesRaw = parseTimeToMinutes(endTime.substring(0, 5));
  if (startMinutes === null || endMinutesRaw === null) return null;

  const endMinutes =
    endMinutesRaw <= startMinutes ? endMinutesRaw + 24 * 60 : endMinutesRaw;

  return {
    startMinutes,
    endMinutes,
    duration: endMinutes - startMinutes,
  };
};

export interface TaskScheduleFormData {
  sopId: string;
  slaId: string;
  slaTaskId: string;
  slaShiftId: string;
  locationId: string;
  locationAddress?: string;
  zoneId: string;
  workAreaId: string;
  workAreaDetailId: string;
  name: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  displayLocation: string;
  durationMinutes: number;
  recurrenceType: string;
  contractStartDate: string;
  contractEndDate: string;
  isActive: boolean;
  workAreaDetailName: string;
  selectedMonth?: number;
}

interface TaskScheduleFormProps {
  initialData?: Partial<CreateTaskScheduleData>;
  onSubmit: (data: CreateTaskScheduleData) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  isModal?: boolean;
}

export function TaskScheduleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Luu",
  isModal = false,
}: TaskScheduleFormProps) {
  // Normalize initialData to ensure camelCase keys (in case API returns PascalCase)
  const normalizedInitialData = useMemo(() => {
    if (!initialData) return {};
    const normalized: any = {};
    Object.entries(initialData).forEach(([key, value]) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      normalized[camelKey] = value;
    });
    return normalized;
  }, [initialData]);

  // Form state
  const [formData, setFormData] = useState<TaskScheduleFormData>({
    sopId: "",
    slaId: "",
    slaTaskId: "",
    slaShiftId: "",
    locationId: "",
    locationAddress: "",
    zoneId: "",
    workAreaId: "",
    workAreaDetailId: "",
    name: "",
    description: "",
    assigneeId: "",
    assigneeName: "",
    displayLocation: "",
    durationMinutes: null as any,
    recurrenceType: "Daily",
    contractStartDate: "",
    contractEndDate: "",
    isActive: true,
    workAreaDetailName: "",
    selectedMonth: 1,
    ...normalizedInitialData,
  });

  // Sync with initialData when it arrives (for edit mode)
  useEffect(() => {
    if (normalizedInitialData && Object.keys(normalizedInitialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...normalizedInitialData,
      }));
    }
  }, [normalizedInitialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<string[]>([""]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
  const [yearlyMonthDays, setYearlyMonthDays] = useState<
    { month: number; day: number }[]
  >([]);
  const [newTime, setNewTime] = useState("");
  const [newDayOfMonth, setNewDayOfMonth] = useState("");
  const [selectedSla, setSelectedSla] = useState<any>(null);
  const [selectedSlaShift, setSelectedSlaShift] = useState<SLAShift | null>(
    null,
  );
  const [selectedSlaTask, setSelectedSlaTask] = useState<SLATask | null>(null);

  // Fetch contract details when SLA is selected
  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ["contract", selectedSla?.contractId],
    queryFn: () => getContractById(selectedSla!.contractId),
    enabled: !!selectedSla?.contractId,
  });

  // Sync contract dates to form when contract is loaded
  useEffect(() => {
    if (contract) {
      // Ensure date is in YYYY-MM-DD format for DateOnly backend compatibility
      const formatDateOnly = (dateStr: string) => {
        if (!dateStr) return "";
        return dateStr.split("T")[0];
      };

      setFormData((prev) => ({
        ...prev,
        contractStartDate: formatDateOnly(contract.contractStartDate),
        contractEndDate: formatDateOnly(contract.contractEndDate),
      }));
    }
  }, [contract]);

  useEffect(() => {
    if (!normalizedInitialData?.recurrenceConfig) return;

    const config = normalizedInitialData.recurrenceConfig;

    if (Array.isArray(config.times) && config.times.length > 0) {
      setTimes(config.times.map((time: string) => normalizeTime(time)));
    }
    if (Array.isArray(config.daysOfWeek)) {
      setSelectedDaysOfWeek(config.daysOfWeek);
    }
    if (Array.isArray(config.daysOfMonth)) {
      setDaysOfMonth(config.daysOfMonth);
    }
    if (Array.isArray(config.monthDays)) {
      const validMonthDays = config.monthDays.filter(
        (md: MonthDay) =>
          md &&
          Number.isInteger(md.month) &&
          md.month >= 1 &&
          md.month <= 12 &&
          Number.isInteger(md.day) &&
          md.day >= 1 &&
          md.day <= 31,
      );
      setYearlyMonthDays(validMonthDays);

      if (validMonthDays.length > 0) {
        const initialMonth = validMonthDays[0].month;
        setFormData((prev) => ({ ...prev, selectedMonth: initialMonth }));
        setDaysOfMonth(
          validMonthDays
            .filter((md: MonthDay) => md.month === initialMonth)
            .map((md: MonthDay) => md.day),
        );
      }
    }
  }, [initialData?.recurrenceConfig]);

  // Helper to update form fields
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sopId) newErrors.sopId = "Vui lòng chọn SOP";
    if (!formData.slaId) newErrors.slaId = "Vui lòng chọn SLA";
    if (!formData.slaTaskId) newErrors.slaTaskId = "Vui lòng chọn SLA Task";
    if (!formData.slaShiftId)
      newErrors.slaShiftId = "Vui lòng chọn ca làm việc";
    if (!formData.locationId) newErrors.locationId = "Vui lòng chọn địa điểm";
    if (!formData.zoneId) newErrors.zoneId = "Vui lòng chọn Zone";
    if (!formData.workAreaId)
      newErrors.workAreaId = "Vui lòng chọn khu vực làm việc";
    if (!formData.name.trim())
      newErrors.name = "Tên lịch trình không được để trống";
    if (!formData.assigneeId)
      newErrors.assigneeId = "Vui lòng chọn nhân viên thực hiện";
    if (!formData.contractStartDate)
      newErrors.contractStartDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.contractEndDate)
      newErrors.contractEndDate = "Vui lòng chọn ngày kết thúc";
    if (
      !Number.isFinite(formData.durationMinutes) ||
      formData.durationMinutes <= 0
    ) {
      newErrors.durationMinutes = "Thời gian thực hiện phải lớn hơn 0 phút";
    }



    const normalizedTimes = Array.from(
      new Set(times.map((time) => normalizeTime(time)).filter(Boolean)),
    );
    if (normalizedTimes.length === 0) {
      newErrors.times = "Vui lòng chọn ít nhất 1 thời điểm bắt đầu";
    } else if (normalizedTimes.length !== times.length) {
      newErrors.times = "Khung giờ bắt đầu không hợp lệ hoặc bị trùng";
    }

    if (
      formData.recurrenceType === "Weekly" &&
      selectedDaysOfWeek.length === 0
    ) {
      newErrors.daysOfWeek = "Vui lòng chọn ít nhất 1 ngày trong tuần";
    }
    if (formData.recurrenceType === "Monthly" && daysOfMonth.length === 0) {
      newErrors.daysOfMonth = "Vui lòng chọn ít nhất 1 ngày trong tháng";
    }
    if (formData.recurrenceType === "Yearly") {
      const resolvedMonthDays =
        selectedSlaTask && yearlyMonthDays.length > 0
          ? yearlyMonthDays
          : daysOfMonth.map((day) => ({
              month: formData.selectedMonth || 1,
              day,
            }));
      if (resolvedMonthDays.length === 0) {
        newErrors.monthDays = "Vui lòng chọn ít nhất 1 ngày trong năm";
      }
    }

    const shiftWindow = getShiftWindow(
      selectedSlaShift?.startTime,
      selectedSlaShift?.endTime,
    );
    if (shiftWindow && normalizedTimes.length > 0) {
      if (formData.durationMinutes > shiftWindow.duration) {
        newErrors.durationMinutes =
          "Thời gian thực hiện không thể dài hơn thời gian của ca";
      }

      const hasInvalidStart = normalizedTimes.some((time) => {
        const timeMinutes = parseTimeToMinutes(time);
        if (timeMinutes === null) return true;

        let adjusted = timeMinutes;
        if (adjusted < shiftWindow.startMinutes) adjusted += 24 * 60;
        return (
          adjusted < shiftWindow.startMinutes ||
          adjusted >= shiftWindow.endMinutes
        );
      });
      if (hasInvalidStart && !newErrors.times) {
        newErrors.times =
          "Giờ bắt đầu phải nằm trong khung thời gian của SLA Shift";
      }

      const hasDurationOverflow = normalizedTimes.some((time) => {
        const timeMinutes = parseTimeToMinutes(time);
        if (timeMinutes === null) return true;

        let adjusted = timeMinutes;
        if (adjusted < shiftWindow.startMinutes) adjusted += 24 * 60;
        return adjusted + formData.durationMinutes > shiftWindow.endMinutes;
      });
      if (hasDurationOverflow && !newErrors.times) {
        newErrors.times =
          "Giờ bắt đầu + thời lượng thực hiện đang vượt quá giới hạn của ca";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle auto-fill logic
  const handleAutoFill = useCallback(
    (data: { sop?: any; sla?: any; slaShift?: any; slaTask?: any }) => {
      const { sop, sla, slaShift, slaTask } = data;
      const updates: Partial<TaskScheduleFormData> = {};

      if (sla) {
        setSelectedSla((prev: any) => (prev?.id === sla.id ? prev : sla));
      }
      setSelectedSlaShift(slaShift || null);
      setSelectedSlaTask(slaTask || null);

      // Only auto-fill name/description if not in edit mode
      // or if they are currently empty
      const isEditMode = !!normalizedInitialData?.id;
      const isCloneMode = !normalizedInitialData?.id && !!normalizedInitialData?.name;

      if (sop && slaTask && !formData.name && !isCloneMode) {
        updates.name = `${slaTask.name}`;
      }

      if (sop && sop.description && !formData.description && !isCloneMode) {
        updates.description = sop.description;
      }

      if (slaShift && slaShift.startTime && slaShift.endTime) {
        // We no longer auto-fill durationMinutes from shift duration as per user request
        
        const shiftStartTime = normalizeTime(
          slaShift.startTime.substring(0, 5),
        );
        // Only set initial time if times array is currently empty or just has the default empty string
        if (shiftStartTime && (times.length <= 1 && !times[0])) {
          setTimes([shiftStartTime]);
        }
      }

      if (slaTask) {
        updates.recurrenceType = slaTask.recurrenceType;

        setSelectedDaysOfWeek([]);
        setDaysOfMonth([]);
        setYearlyMonthDays([]);

        const config = slaTask.recurrenceConfig;
        if (config) {
          // Initialize times array based on interval (repetitions)
          const interval = config.interval || 1;
          const newTimes = Array(interval).fill("");
          
          // If we already have some times, try to preserve them, otherwise leave empty for manager to fill
          setTimes(newTimes);

          if (
            slaTask.recurrenceType === "Weekly" &&
            Array.isArray(config.daysOfWeek)
          ) {
            setSelectedDaysOfWeek(config.daysOfWeek);
          }

          if (
            slaTask.recurrenceType === "Monthly" &&
            Array.isArray(config.daysOfMonth)
          ) {
            setDaysOfMonth(config.daysOfMonth);
          }

          if (
            slaTask.recurrenceType === "Yearly" &&
            Array.isArray(config.monthDays)
          ) {
        const validMonthDays: MonthDay[] =
          config.monthDays.filter(
            (md: MonthDay) =>
                  md &&
                  Number.isInteger(md.month) &&
                  md.month >= 1 &&
                  md.month <= 12 &&
                  Number.isInteger(md.day) &&
                  md.day >= 1 &&
                  md.day <= 31,
              );
            setYearlyMonthDays(validMonthDays);

            if (validMonthDays.length > 0) {
              updates.selectedMonth = validMonthDays[0].month;
              setDaysOfMonth(
                validMonthDays
                  .filter(
                    (md: MonthDay) =>
                      md.month === validMonthDays[0].month,
                  )
                  .map((md: MonthDay) => md.day),
              );
            }
          }
        }
      }

      setFormData((prev) => {
        // Only update if there are actual changes to avoid loops
        const hasChanges = Object.keys(updates).some(
          (key) =>
            prev[key as keyof TaskScheduleFormData] !== (updates as any)[key],
        );
        if (!hasChanges) return prev;
        return { ...prev, ...updates };
      });
    },
    [],
  );

  // Time and day management
  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime]);
      setNewTime("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const addDayOfMonth = () => {
    const day = parseInt(newDayOfMonth);
    if (day >= 1 && day <= 31 && !daysOfMonth.includes(day)) {
      setDaysOfMonth([...daysOfMonth, day].sort((a, b) => a - b));
      setNewDayOfMonth("");
    }
  };

  const removeDayOfMonth = (dayToRemove: number) => {
    setDaysOfMonth(daysOfMonth.filter((d) => d !== dayToRemove));
  };

  const toggleDayOfWeek = (day: string) => {
    setSelectedDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const formatSlaTaskConfigSummary = (task: SLATask | null): string => {
    if (!task) return "-";

    const interval = task.recurrenceConfig?.interval ?? 1;
    if (task.recurrenceType === "Daily") {
      return `Mỗi ${interval} ngày`;
    }
    if (task.recurrenceType === "Weekly") {
      const days = task.recurrenceConfig?.daysOfWeek || [];
      return `Mỗi ${interval} tuần (${days.join(", ") || "chưa chọn ngày"})`;
    }
    if (task.recurrenceType === "Monthly") {
      const days = task.recurrenceConfig?.daysOfMonth || [];
      return `Mỗi ${interval} tháng (ngày ${days.join(", ") || "?"})`;
    }
    if (task.recurrenceType === "Yearly") {
      const monthDays = task.recurrenceConfig?.monthDays || [];
      const labels = monthDays.map((md) => `${md.day}/${md.month}`).join(", ");
      return `Mỗi ${interval} năm (${labels || "chưa chọn ngày"})`;
    }
    return task.recurrenceType;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedTimes = Array.from(
      new Set(times.map((time) => normalizeTime(time)).filter(Boolean)),
    );
    const formattedTimes = normalizedTimes.map((time) => `${time}:00`);

    let recurrenceConfig: RecurrenceConfig = {
      times: formattedTimes,
    };

    if (formData.recurrenceType === "Weekly") {
      recurrenceConfig = {
        ...recurrenceConfig,
        daysOfWeek: selectedDaysOfWeek,
      };
    }
    if (formData.recurrenceType === "Monthly") {
      recurrenceConfig = {
        ...recurrenceConfig,
        daysOfMonth,
      };
    }
    if (formData.recurrenceType === "Yearly") {
      const monthDays =
        selectedSlaTask && yearlyMonthDays.length > 0
          ? yearlyMonthDays
          : daysOfMonth.map((day) => ({
              month: formData.selectedMonth || 1,
              day,
            }));
      recurrenceConfig = {
        ...recurrenceConfig,
        monthDays,
      };
    }

    const submitData: CreateTaskScheduleData = {
      sopId: formData.sopId,
      slaTaskId: formData.slaTaskId,
      slaShiftId: formData.slaShiftId,
      workAreaId: formData.workAreaId,
      workAreaDetailId: formData.workAreaDetailId,
      name: formData.name,
      description: formData.description,
      assigneeId: formData.assigneeId,
      assigneeName: formData.assigneeName,
      displayLocation: formData.displayLocation,
      durationMinutes: formData.durationMinutes,
      recurrenceType: formData.recurrenceType,
      recurrenceConfig,
      contractStartDate: formData.contractStartDate.split("T")[0],
      contractEndDate: formData.contractEndDate.split("T")[0],
      isActive: formData.isActive,
    };

    onSubmit(submitData);
  };

  return (
    <div className={isModal ? "w-full" : "max-w-[1200px] mx-auto"}>
      <form
        onSubmit={handleSubmit}
        className={`grid grid-cols-1 ${isModal ? "xl:grid-cols-3" : "lg:grid-cols-3"} gap-6`}
      >
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Cấu hình SOP và SLA">
            <SOPTaskSection
              formData={formData}
              updateField={updateField}
              errors={errors}
              onAutoFill={handleAutoFill}
            />
          </SectionCard>

          <SectionCard 
            title="Địa điểm & Khu vực"
            className={!formData.slaId ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}
          >
            <WorkAreaSection
              formData={formData}
              updateField={updateField}
              errors={errors}
            />
          </SectionCard>

          <SectionCard 
            title="Cấu hình lặp lại"
            className={!selectedSlaTask ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}
          >
            <RecurrenceSection
              formData={formData}
              updateField={updateField}
              errors={errors}
              times={times}
              setTimes={setTimes}
              selectedDaysOfWeek={selectedDaysOfWeek}
              setSelectedDaysOfWeek={setSelectedDaysOfWeek}
              daysOfMonth={daysOfMonth}
              setDaysOfMonth={setDaysOfMonth}
              newTime={newTime}
              setNewTime={setNewTime}
              newDayOfMonth={newDayOfMonth}
              setNewDayOfMonth={setNewDayOfMonth}
              addTime={addTime}
              removeTime={removeTime}
              addDayOfMonth={addDayOfMonth}
              removeDayOfMonth={removeDayOfMonth}
              toggleDayOfWeek={toggleDayOfWeek}
            />
          </SectionCard>

          <SectionCard 
            title="Thông tin cơ bản"
            className={!selectedSlaTask ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}
          >
            <BasicInfoSection
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
          </SectionCard>

          <SectionCard 
            title="Phân công nhân sự"
            className={!selectedSlaTask || !formData.locationId ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}
          >
            <AssignmentSection
              formData={formData}
              updateField={updateField}
              errors={errors}
            />
          </SectionCard>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Button type="button" variant="outline" asChild>
              <Link href="/manager/task-schedule">Hủy</Link>
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px] rounded-[8px]"
            >
              {submitButtonText}
            </Button>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contract Context Card */}
          <Card className="bg-white rounded-[8px] border overflow-hidden">
            <div className="bg-primary/5 p-4 border-b flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">
                Thông tin Hợp đồng
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {contractLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
              ) : contract ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      Tên hợp đồng
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {contract.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                        Ngày bắt đầu
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm font-medium">
                          {formatDate(contract.contractStartDate)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                        Ngày kết thúc
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm font-medium">
                          {formatDate(contract.contractEndDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Thời hạn của lịch trình này sẽ được tự động giới hạn
                        trong phạm vi hiệu lực của hợp đồng.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm italic">
                    Chọn SLA để xem hợp đồng
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* SLA Task Summary Card */}
          {selectedSla && (
            <Card className="bg-white rounded-[8px] border overflow-hidden">
              <div className="bg-green-50 p-4 border-b flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-700">Tóm tắt SLA</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">
                    DỊCH VỤ
                  </p>
                  <p className="text-sm">{selectedSla.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">
                    CẤU HÌNH LẶP LẠI
                  </p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {formData.recurrenceType}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">
                    Quy định ca làm việc
                  </p>
                  <p className="text-sm">
                    {selectedSlaShift
                      ? `${selectedSlaShift.name} (${selectedSlaShift.startTime?.substring(0, 5)} - ${selectedSlaShift.endTime?.substring(0, 5)})`
                      : "Chưa chọn"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">
                    Quy định công việc
                  </p>
                  <p className="text-sm">
                    {selectedSlaTask ? selectedSlaTask.name : "Chưa chọn"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatSlaTaskConfigSummary(selectedSlaTask)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Status Section */}
          <SectionCard title="Trạng thái">
            <StatusSection formData={formData} updateField={updateField} />
          </SectionCard>
        </div>
      </form>
    </div>
  );
}
