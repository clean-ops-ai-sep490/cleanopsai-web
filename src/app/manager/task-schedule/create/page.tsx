"use client";

import { useEffect, useState } from "react";
import { TaskScheduleForm } from "@/components/task-schedule/TaskScheduleForm";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { useCreateTaskSchedule } from "@/hooks/useTaskSchedules";
import { useRouter } from "next/navigation";
import { CreateTaskScheduleData } from "@/types/schedule";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Tạo lịch trình mới"
        description="Thiết lập kịch bản làm việc định kỳ cho các khu vực."
        breadcrumbs={
          <Link 
            href="/manager/task-schedule" 
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại danh sách
          </Link>
        }
      />

      {ready ? (
        <TaskScheduleForm 
          onSubmit={handleSubmit} 
          isSubmitting={createTaskSchedule.isPending}
          submitButtonText="Tạo lịch trình"
        />
      ) : (
        <DetailPageSkeleton />
      )}
    </div>
  );
}
