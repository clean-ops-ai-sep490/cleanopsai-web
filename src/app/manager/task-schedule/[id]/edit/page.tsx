"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskScheduleForm } from "@/components/task-schedule/TaskScheduleForm";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";

export default function EditTaskSchedulePage() {
  const params = useParams();
  const id = params.id as string;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ready ? <TaskScheduleForm taskScheduleId={id} /> : <DetailPageSkeleton />}
    </>
  );
}
