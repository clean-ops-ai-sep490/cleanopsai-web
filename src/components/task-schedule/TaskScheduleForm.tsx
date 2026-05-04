"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CreateTaskScheduleData, RecurrenceConfig } from "@/types/schedule";

// Import form sections
import { BasicInfoSection } from "./forms/BasicInfoSection";
import { SOPTaskSection } from "./forms/SOPTaskSection";
import { WorkAreaSection } from "./forms/WorkAreaSection";
import { AssignmentSection } from "./forms/AssignmentSection";
import { RecurrenceSection } from "./forms/RecurrenceSection";
import { ContractPeriodSection } from "./forms/ContractPeriodSection";
import { StatusSection } from "./forms/StatusSection";

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
  supervisorId: string;
  displayLocation: string;
  durationMinutes: number;
  recurrenceType: string;
  contractStartDate: string;
  contractEndDate: string;
  isActive: boolean;
  workAreaDetailName: string;
  workAreaDetailArea: number;
  selectedMonth?: number;
}

interface TaskScheduleFormProps {
  initialData?: Partial<CreateTaskScheduleData & { supervisorId: string }>;
  onSubmit: (data: CreateTaskScheduleData & { supervisorId: string }) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function TaskScheduleForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Lưu",
}: TaskScheduleFormProps) {
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
    supervisorId: "",
    displayLocation: "",
    durationMinutes: 60,
    recurrenceType: "Daily",
    contractStartDate: "",
    contractEndDate: "",
    isActive: true,
    workAreaDetailName: "",
    workAreaDetailArea: 0,
    selectedMonth: 1,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
  const [newTime, setNewTime] = useState("");
  const [newDayOfMonth, setNewDayOfMonth] = useState("");

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
    if (!formData.slaShiftId) newErrors.slaShiftId = "Vui lòng chọn ca làm việc";
    if (!formData.locationId) newErrors.locationId = "Vui lòng chọn địa điểm";
    if (!formData.zoneId) newErrors.zoneId = "Vui lòng chọn Zone";
    if (!formData.workAreaId) newErrors.workAreaId = "Vui lòng chọn khu vực làm việc";
    if (!formData.name.trim()) newErrors.name = "Tên lịch trình không được để trống";
    if (!formData.assigneeId) newErrors.assigneeId = "Vui lòng chọn nhân viên thực hiện";
    if (!formData.supervisorId) newErrors.supervisorId = "Vui lòng chọn người giám sát";
    if (!formData.contractStartDate) newErrors.contractStartDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.contractEndDate) newErrors.contractEndDate = "Vui lòng chọn ngày kết thúc";
    
    if (formData.workAreaDetailName && formData.workAreaDetailName.trim() === "") {
        newErrors.workAreaDetailName = "Tên chi tiết khu vực không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle auto-fill logic
  const handleAutoFill = (data: {
    sop?: any;
    sla?: any;
    slaShift?: any;
    slaTask?: any;
  }) => {
    const { sop, sla, slaShift, slaTask } = data;
    const updates: Partial<TaskScheduleFormData> = {};

    if (sop && slaTask) {
      updates.name = `${sop.name} - ${slaTask.name}`;
    }

    if (sop && sop.description) {
      updates.description = sop.description;
    }

    if (slaShift && slaShift.startTime && slaShift.endTime) {
      const [startHour, startMin] = slaShift.startTime.split(":").map(Number);
      const [endHour, endMin] = slaShift.endTime.split(":").map(Number);
      const duration = endHour * 60 + endMin - (startHour * 60 + startMin);
      if (duration > 0) {
        updates.durationMinutes = duration;
      }
    }

    if (slaTask) {
      updates.recurrenceType = slaTask.recurrenceType;
      if (slaTask.recurrenceConfig) {
        const config = slaTask.recurrenceConfig;
        if (slaTask.recurrenceType === "Weekly" && config.daysOfWeek) {
          setSelectedDaysOfWeek(config.daysOfWeek);
        }
        if (slaTask.recurrenceType === "Monthly" && config.daysOfMonth) {
          setDaysOfMonth(config.daysOfMonth);
        }
        if (slaTask.recurrenceType === "Yearly" && config.monthDays) {
          const days = config.monthDays.map((md: any) => md.day);
          setDaysOfMonth(days);
          if (config.monthDays.length > 0) {
            updates.selectedMonth = config.monthDays[0].month;
          }
        }
      }

      if (slaShift && slaShift.startTime) {
        const timeStr = slaShift.startTime.substring(0, 5);
        setTimes([timeStr]);
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert times for API
    const formattedTimes = times.map((t) => (t.split(":").length === 3 ? t : `${t}:00`));

    const recurrenceConfig: RecurrenceConfig = {
      times: formattedTimes,
      daysOfWeek: selectedDaysOfWeek,
      daysOfMonth,
      monthDays: [],
    };

    const submitData: CreateTaskScheduleData & { supervisorId: string } = {
      ...(formData as any),
      recurrenceConfig,
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white rounded-[8px] p-6 border">
          <BasicInfoSection formData={formData} errors={errors} updateField={updateField} />
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
          <SOPTaskSection
            formData={formData}
            updateField={updateField}
            errors={errors}
            onAutoFill={handleAutoFill}
          />
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
          <WorkAreaSection
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
          <AssignmentSection
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
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
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
          <ContractPeriodSection formData={formData} errors={errors} updateField={updateField} />
        </Card>

        <Card className="bg-white rounded-[8px] p-6 border">
          <StatusSection formData={formData} updateField={updateField} />
        </Card>

        <div className="flex items-center justify-end gap-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/manager/task-schedule">Hủy</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-[#308cab] text-white min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
