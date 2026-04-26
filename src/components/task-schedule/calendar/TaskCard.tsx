"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { TaskDetailDialog } from "./TaskDetailDialog";
import type { TaskAssignment } from "@/types/task-assignment";
import { Clock, MapPin } from "lucide-react";

interface TaskCardProps {
  task: TaskAssignment;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500 hover:bg-green-600 text-white border-green-600";
    case "InProgress":
      return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600";
    case "Cancelled":
      return "bg-gray-400 hover:bg-gray-500 text-white border-gray-500";
    default: // NotStarted
      return "bg-orange-500 hover:bg-orange-600 text-white border-orange-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return "✓";
    case "InProgress":
      return "●";
    case "Cancelled":
      return "✕";
    default:
      return "○";
  }
};

export function TaskCard({ task }: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const startTime = format(parseISO(task.scheduledStartAt), "HH:mm");
  const endTime = format(parseISO(task.scheduledEndAt), "HH:mm");
  const location = task.displayLocation.split(",")[0].trim();

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className={`${getStatusColor(task.status)} rounded-lg border-l-4 px-3 py-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md h-[28px] flex items-center justify-between relative overflow-hidden`}
        title={`${task.displayLocation}\n${startTime} - ${endTime}\nTrạng thái: ${task.status}`}
      >
        {/* Left content */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Status icon */}
          <span className="text-xs font-bold flex-shrink-0">
            {getStatusIcon(task.status)}
          </span>

          {/* Time */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-semibold">{startTime}</span>
          </div>

          {/* Location/Task name */}
          <div className="text-xs font-medium truncate">
            {task.isAdhocTask ? (
              <span className="font-bold">{task.nameAdhocTask}</span>
            ) : (
              <span>{location}</span>
            )}
          </div>
        </div>

        {/* Right content */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* End time */}
          <span className="text-xs opacity-90">{endTime}</span>

          {/* Adhoc indicator */}
          {task.isAdhocTask && (
            <span className="text-[10px] bg-white/30 px-1 rounded">ĐX</span>
          )}
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 pointer-events-none"></div>
      </div>

      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
