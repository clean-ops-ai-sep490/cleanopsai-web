"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskScheduleEditContainer } from "@/components/task-schedule";

export default function EditTaskSchedulePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <DashboardLayout>
      <TaskScheduleEditContainer id={id} />
    </DashboardLayout>
  );
}
