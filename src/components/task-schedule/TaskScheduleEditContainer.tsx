"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TaskScheduleForm } from "./TaskScheduleForm";
import {
  useTaskSchedule,
  useUpdateTaskSchedule,
} from "@/hooks/useTaskSchedules";
import { UpdateTaskScheduleData } from "@/types/schedule";

interface TaskScheduleEditContainerProps {
  id: string;
}

export function TaskScheduleEditContainer({
  id,
}: TaskScheduleEditContainerProps) {
  const router = useRouter();
  const { data: schedule, isLoading, error } = useTaskSchedule(id);
  const updateMutation = useUpdateTaskSchedule();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateTaskScheduleData) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ id, data });
      router.push(`/manager/task-schedule`);
    } catch (error) {
      console.error("Error updating task schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-[#70808f]">
          Đang tải thông tin lịch trình...
        </span>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Không thể tải thông tin lịch trình</p>
        <Link href="/manager/task-schedule">
          <Button variant="outline" className="border-[#e5e5e5]">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/manager/task-schedule`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-medium text-black mb-1">
            Chỉnh sửa lịch trình
          </h1>
          <p className="text-sm text-[#70808f]">
            Cập nhật thông tin lịch trình: {schedule.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <TaskScheduleForm
        initialData={schedule}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Cập nhật lịch trình"
      />
    </div>
  );
}
