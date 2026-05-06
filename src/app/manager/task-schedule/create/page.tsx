"use client";

import { useEffect, useState } from "react";
import { TaskScheduleForm } from "@/components/task-schedule/TaskScheduleForm";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { useCreateTaskSchedule } from "@/hooks/useTaskSchedules";
import { useRouter } from "next/navigation";
import { CreateTaskScheduleData } from "@/types/schedule";

export default function CreateTaskSchedulePage() {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const createTaskSchedule = useCreateTaskSchedule();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (data: CreateTaskScheduleData) => {
    try {
      await createTaskSchedule.mutateAsync(data);
      router.push("/manager/task-schedule");
    } catch (error) {
      console.error("Failed to create task schedule:", error);
    }
  };

  return (
    <>
      {ready ? (
        <TaskScheduleForm 
          onSubmit={handleSubmit} 
          isSubmitting={createTaskSchedule.isPending}
          submitButtonText="Tạo lịch trình"
        />
      ) : (
        <DetailPageSkeleton />
      )}
    </>
  );
}
