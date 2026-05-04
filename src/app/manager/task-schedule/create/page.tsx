"use client";

import { useEffect, useState } from "react";
import { TaskScheduleForm } from "@/components/task-schedule/TaskScheduleForm";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";

export default function CreateTaskSchedulePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ready ? <TaskScheduleForm /> : <DetailPageSkeleton />}
    </>
  );
}
