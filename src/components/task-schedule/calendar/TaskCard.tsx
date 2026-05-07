"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { TaskDetailDialog } from "./TaskDetailDialog";
import type { TaskAssignment } from "@/types/task-assignment";

interface TaskCardProps {
  task: TaskAssignment;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Completed":
      return {
        wrapper: "bg-emerald-50/90 border-l-[3px] border-emerald-500 hover:bg-emerald-100 hover:shadow-emerald-100/50",
        timeText: "text-emerald-700/70",
        titleText: "text-emerald-900",
      };
    case "InProgress":
      return {
        wrapper: "bg-blue-50/90 border-l-[3px] border-blue-500 hover:bg-blue-100 hover:shadow-blue-100/50",
        timeText: "text-blue-700/70",
        titleText: "text-blue-900",
      };
    case "Cancelled":
      return {
        wrapper: "bg-slate-50/90 border-l-[3px] border-slate-400 hover:bg-slate-100 hover:shadow-slate-100/50 opacity-80",
        timeText: "text-slate-500/70",
        titleText: "text-slate-700",
      };
    default: // NotStarted
      return {
        wrapper: "bg-amber-50/90 border-l-[3px] border-amber-500 hover:bg-amber-100 hover:shadow-amber-100/50",
        timeText: "text-amber-700/70",
        titleText: "text-amber-900",
      };
  }
};

export function TaskCard({ task }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const startAt = parseISO(task.scheduledStartAt.replace("Z", ""));
  const endAt = parseISO(task.scheduledEndAt.replace("Z", ""));
  const startTime = format(startAt, "HH:mm");
  const endTime = format(endAt, "HH:mm");
  
  const styles = getStatusStyles(task.status);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`${styles.wrapper} group relative h-8 rounded-r-md px-2.5 flex items-center cursor-pointer transition-all duration-200 shadow-sm backdrop-blur-sm overflow-hidden`}
        title={`${task.taskName}\n${task.displayLocation}\n${startTime} - ${endTime}\nTrạng thái: ${task.status}`}
      >
        <div className="flex items-center gap-1.5 w-full z-10 relative">
          <span className={`text-[10px] font-bold tracking-tight whitespace-nowrap ${styles.timeText}`}>
            {startTime}
          </span>
          <span className={`text-[11px] font-semibold truncate flex-1 ${styles.titleText}`}>
            {task.taskName || (task.isAdhocTask ? task.nameAdhocTask : "Công việc")}
          </span>
        </div>
      </div>

      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
