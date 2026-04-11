"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskScheduleCreateContainer } from "@/components/task-schedule/TaskScheduleCreateContainer";

export default function CreateTaskSchedulePage() {
  return (
    <DashboardLayout>
      <TaskScheduleCreateContainer />
    </DashboardLayout>
  );
}
