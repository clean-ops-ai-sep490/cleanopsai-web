"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Validation schema
const taskScheduleSchema = z.object({
  sopId: z.string().min(1, "SOP là bắt buộc"),
  slaId: z.string().min(1, "SLA là bắt buộc"),
  slaTaskId: z.string().min(1, "SLA Task là bắt buộc"),
  slaShiftId: z.string().min(1, "SLA Shift là bắt buộc"),
  locationId: z.string().min(1, "Địa điểm là bắt buộc"),
  locationAddress: z.string(), // Address của location đã chọn
  zoneId: z.string().min(1, "Zone là bắt buộc"),
  workAreaId: z.string().min(1, "Khu vực làm việc là bắt buộc"),
  workAreaDetailId: z.string().min(1, "Chi tiết khu vực là bắt buộc"),
  name: z.string().min(1, "Tên lịch trình là bắt buộc"),
  description: z.string(),
  assigneeId: z.string().min(1, "Người thực hiện là bắt buộc"),
  assigneeName: z.string().min(1, "Tên người thực hiện là bắt buộc"),
  supervisorId: z.string().min(1, "Người giám sát là bắt buộc"),
  displayLocation: z.string().min(1, "Địa điểm hiển thị là bắt buộc"),
  durationMinutes: z.number().min(1, "Thời gian thực hiện phải lớn hơn 0"),
  recurrenceType: z.string().min(1, "Loại lặp lại là bắt buộc"),
  contractStartDate: z.string().min(1, "Ngày bắt đầu hợp đồng là bắt buộc"),
  contractEndDate: z.string().min(1, "Ngày kết thúc hợp đồng là bắt buộc"),
  isActive: z.boolean(),
  // WorkAreaDetail creation fields
  workAreaDetailName: z.string().min(1, "Tên chi tiết khu vực là bắt buộc"),
  workAreaDetailArea: z.number().min(0, "Diện tích là bắt buộc"),
});

type TaskScheduleFormData = z.infer<typeof taskScheduleSchema>;

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
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
  const [newTime, setNewTime] = useState("");
  const [newDayOfMonth, setNewDayOfMonth] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskScheduleFormData>({
    resolver: zodResolver(taskScheduleSchema),
    defaultValues: {
      isActive: true,
      durationMinutes: 60,
      recurrenceType: "Daily",
      description: "",
      ...initialData,
    },
  });

  // Time management functions
  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime]);
      setNewTime("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    setTimes(times.filter((time) => time !== timeToRemove));
  };

  // Day of month management functions
  const addDayOfMonth = () => {
    const day = parseInt(newDayOfMonth);
    if (day >= 1 && day <= 31 && !daysOfMonth.includes(day)) {
      setDaysOfMonth([...daysOfMonth, day].sort((a, b) => a - b));
      setNewDayOfMonth("");
    }
  };

  const removeDayOfMonth = (dayToRemove: number) => {
    setDaysOfMonth(daysOfMonth.filter((day) => day !== dayToRemove));
  };

  // Day of week management function
  const toggleDayOfWeek = (day: string) => {
    setSelectedDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const onFormSubmit = (data: TaskScheduleFormData) => {
    // Convert times from HH:MM to HH:MM:SS format for API
    const formattedTimes = times.map((time) => {
      // If time is already in HH:MM:SS format, keep it
      if (time.split(":").length === 3) {
        return time;
      }
      // If time is in HH:MM format, add :00 seconds
      return `${time}:00`;
    });

    const recurrenceConfig: RecurrenceConfig = {
      times: formattedTimes,
      daysOfWeek: selectedDaysOfWeek,
      daysOfMonth,
      monthDays: [], // Can be extended later
    };

    const submitData: CreateTaskScheduleData & { supervisorId: string } = {
      ...data,
      recurrenceConfig,
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <BasicInfoSection register={register} errors={errors} />
        </Card>

        {/* SOP & Task Configuration Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <SOPTaskSection setValue={setValue} errors={errors} />
        </Card>

        {/* Work Area Configuration Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <WorkAreaSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </Card>

        {/* Assignment Configuration Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <AssignmentSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        </Card>

        {/* Recurrence Configuration Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <RecurrenceSection
            setValue={setValue}
            watch={watch}
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

        {/* Contract Period Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <ContractPeriodSection register={register} errors={errors} />
        </Card>

        {/* Status Card */}
        <Card className="bg-white rounded-[8px] p-6 border">
          <StatusSection setValue={setValue} watch={watch} />
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/task-schedule">Hủy</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1a80a2] hover:bg-[#308cab] text-white min-w-[120px]"
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
