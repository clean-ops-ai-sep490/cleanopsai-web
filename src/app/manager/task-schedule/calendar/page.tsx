"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TaskCalendarView } from "@/components/task-schedule/calendar/TaskCalendarView";

export default function TaskScheduleCalendarPage() {
  return (
    <DashboardLayout>
      <TaskCalendarView />
    </DashboardLayout>
  );
}
