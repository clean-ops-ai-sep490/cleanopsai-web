"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { TaskCard } from "./TaskCard";
import { useTaskAssignments } from "@/hooks/useTaskAssignments";
import type { TaskAssignment } from "@/types/task-assignment";
import { TaskAssignmentStatus } from "@/types/task";
import { getDayRange } from "@/lib/utils";
import { Loader2, MapPin, Clock } from "lucide-react";

interface CalendarGridProps {
  currentDate: Date;
  searchQuery: string;
  selectedFilter: string;
}

interface WorkerGroup {
  assigneeId: string;
  assigneeName: string;
  location: string;
  tasks: TaskAssignment[];
}

export function CalendarGrid({
  currentDate,
  searchQuery,
  selectedFilter,
}: CalendarGridProps) {
  // Get date range for the selected date (00:00:00 to 23:59:59)
  const { fromDate, toDate } = getDayRange(currentDate);

  // Fetch task assignments for the selected date
  const { data, isLoading, error } = useTaskAssignments({
    fromDate, // e.g., "2026-04-29T00:00:00.000Z"
    toDate, // e.g., "2026-04-29T23:59:59.999Z"
    pageNumber: 1,
    pageSize: 500,
    ...(selectedFilter !== "all" && {
      status: selectedFilter as TaskAssignmentStatus,
    }),
  });

  // Group tasks by worker
  const workerGroups: WorkerGroup[] = [];
  if (data?.content) {
    const groupMap = new Map<string, WorkerGroup>();

    data.content.forEach((task) => {
      if (!groupMap.has(task.assigneeId)) {
        groupMap.set(task.assigneeId, {
          assigneeId: task.assigneeId,
          assigneeName: task.assigneeName,
          location: task.displayLocation,
          tasks: [],
        });
      }
      groupMap.get(task.assigneeId)!.tasks.push(task);
    });

    workerGroups.push(...Array.from(groupMap.values()));
  }

  // Time slots from 6 AM to 22 PM (10 PM) - 17 slots
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  // Calculate task position and width based on time
  const getTaskPosition = (task: TaskAssignment) => {
    const taskStart = parseISO(task.scheduledStartAt);
    const taskEnd = parseISO(task.scheduledEndAt);

    const startHour = taskStart.getHours();
    const startMinute = taskStart.getMinutes();
    const endHour = taskEnd.getHours();
    const endMinute = taskEnd.getMinutes();

    // Calculate position from 6:00
    const startOffset = startHour - 6 + startMinute / 60;
    const endOffset = endHour - 6 + endMinute / 60;
    const duration = Math.max(0.5, endOffset - startOffset); // Minimum 30 minutes

    // Each hour slot is 1/17 of the width
    const leftPercent = Math.max(0, (startOffset / 17) * 100);
    const widthPercent = Math.min(100 - leftPercent, (duration / 17) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      startTime: format(taskStart, "HH:mm"),
      endTime: format(taskEnd, "HH:mm"),
    };
  };

  const getTasksForWorker = (worker: WorkerGroup) => {
    return worker.tasks.map((task) => {
      const position = getTaskPosition(task);
      return { task, position };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Không thể tải dữ liệu lịch làm việc</p>
      </div>
    );
  }

  if (workerGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg font-medium">Không có task nào</p>
          <p className="text-gray-400 text-sm">
            {format(currentDate, "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>
    );
  }

  const isToday = isSameDay(currentDate, new Date());
  const currentHour = new Date().getHours();

  return (
    <div className="flex flex-col bg-white">
      {/* Date Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 uppercase tracking-wide">
            {format(currentDate, "EEEE", { locale: vi })}
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${
              isToday ? "text-primary" : "text-gray-900"
            }`}
          >
            {format(currentDate, "dd/MM/yyyy")}
          </div>
          {isToday && (
            <div className="text-xs text-primary font-medium mt-1">
              HÔM NAY
            </div>
          )}
        </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="grid" style={{ gridTemplateColumns: "280px 1fr" }}>
          {/* Worker column header */}
          <div className="p-4 border-r border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">⚠</span>
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                NHÂN VIÊN / ZONE
              </span>
            </div>
          </div>

          {/* Time slots header */}
          <div className="bg-gray-50">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))`,
              }}
            >
              {timeSlots.map((hour) => {
                const isCurrentHour = isToday && hour === currentHour;
                return (
                  <div
                    key={hour}
                    className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                      isCurrentHour ? "bg-red-50 text-red-700" : "text-gray-600"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isCurrentHour ? "text-red-700" : "text-gray-700"
                      }`}
                    >
                      {hour}:00
                    </div>
                    {isCurrentHour && (
                      <div className="text-xs text-red-600 font-medium mt-1">
                        HIỆN TẠI
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Worker Rows */}
      <div>
        <div className="divide-y divide-gray-200">
          {workerGroups.map((worker, index) => {
            const tasksForWorker = getTasksForWorker(worker);
            const completedTasks = worker.tasks.filter(
              (t) => t.status === "Completed",
            ).length;
            const totalTasks = worker.tasks.length;

            return (
              <div
                key={worker.assigneeId}
                className={`grid hover:bg-gray-50/50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
                style={{ gridTemplateColumns: "280px 1fr" }}
              >
                {/* Worker Info */}
                <div className="p-4 border-r border-gray-200">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-white shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-[#1a80a2] to-[#308cab] text-white text-sm font-bold">
                        {worker.assigneeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-900 truncate">
                        {worker.assigneeName}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {worker.location.split(",")[0]}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 border-primary text-primary bg-blue-50"
                        >
                          {totalTasks} công việc
                        </Badge>
                        {completedTasks > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 border-green-500 text-green-700 bg-green-50"
                          >
                            {completedTasks} hoàn thành
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative min-h-[100px] py-2">
                  {/* Time grid background */}
                  <div
                    className="absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${timeSlots.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {timeSlots.map((hour, hourIndex) => {
                      const isCurrentHour = isToday && hour === currentHour;
                      return (
                        <div
                          key={hourIndex}
                          className={`border-r border-gray-100 last:border-r-0 ${
                            isCurrentHour ? "bg-red-50/30" : ""
                          }`}
                        >
                          {/* Current time indicator */}
                          {isCurrentHour && (
                            <div className="absolute top-0 left-0 w-full h-full bg-red-100/20 border-l-2 border-red-500"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tasks */}
                  <div className="relative h-full px-2">
                    {tasksForWorker.map(({ task, position }, taskIndex) => (
                      <div
                        key={task.id}
                        className="absolute"
                        style={{
                          left: position.left,
                          width: position.width,
                          top: `${taskIndex * 32 + 8}px`,
                          zIndex: 10,
                        }}
                      >
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
