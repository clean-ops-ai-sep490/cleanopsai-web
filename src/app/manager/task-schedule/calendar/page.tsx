"use client";

import { TaskCalendarView } from "@/components/task-schedule/calendar/TaskCalendarView";
import { CalendarPageSkeleton } from "@/components/ui/page-skeleton";
import { useEffect, useState } from "react";

export default function TaskScheduleCalendarPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ready ? <TaskCalendarView /> : <CalendarPageSkeleton />}
    </>
  );
}
