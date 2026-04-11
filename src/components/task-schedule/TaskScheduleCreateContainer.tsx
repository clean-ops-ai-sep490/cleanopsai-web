"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreateTaskSchedule } from "@/hooks/useTaskSchedules";
import { CreateTaskScheduleData } from "@/types/schedule";
import { TaskScheduleForm } from "./TaskScheduleForm";

export function TaskScheduleCreateContainer() {
  const router = useRouter();
  const createMutation = useCreateTaskSchedule();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateTaskScheduleData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
      router.push("/dashboard/task-schedule");
    } catch (error) {
      console.error("Error creating task schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/task-schedule">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-medium text-black mb-1">
            Tạo lịch trình mới
          </h1>
          <p className="text-sm text-[#70808f]">
            Tạo lịch trình công việc cho nhân viên
          </p>
        </div>
      </div>

      {/* Form */}
      <TaskScheduleForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Tạo lịch trình"
      />
    </div>
  );
}
