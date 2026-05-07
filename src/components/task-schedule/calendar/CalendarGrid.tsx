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
import { Loader2, MapPin, Clock, User as UserIcon } from "lucide-react";

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
  const { fromDate, toDate } = getDayRange(currentDate);

  const { data, isLoading, error } = useTaskAssignments({
    fromDate,
    toDate,
    pageNumber: 1,
    pageSize: 500,
    ...(selectedFilter !== "all" && {
      status: selectedFilter as TaskAssignmentStatus,
    }),
  });

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

  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  const getTaskPosition = (task: TaskAssignment) => {
    const taskStart = parseISO(task.scheduledStartAt.replace("Z", ""));
    const taskEnd = parseISO(task.scheduledEndAt.replace("Z", ""));

    const startHour = taskStart.getHours();
    const startMinute = taskStart.getMinutes();
    const endHour = taskEnd.getHours();
    const endMinute = taskEnd.getMinutes();

    const startOffset = startHour - 6 + startMinute / 60;
    const endOffset = endHour - 6 + endMinute / 60;
    const duration = Math.max(0.5, endOffset - startOffset);

    const leftPercent = Math.max(0, (startOffset / 17) * 100);
    const widthPercent = Math.min(100 - leftPercent, (duration / 17) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
          <Loader2 className="w-10 h-10 animate-spin text-primary absolute inset-0 [animation-delay:0.2s]" />
        </div>
        <span className="text-slate-400 font-medium text-sm">Đang đồng bộ dữ liệu lịch làm việc...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-rose-50 rounded-2xl border border-rose-100">
          <p className="text-rose-600 font-semibold">Không thể kết nối máy chủ</p>
          <p className="text-rose-400 text-sm mt-1">Vui lòng kiểm tra lại kết nối mạng.</p>
        </div>
      </div>
    );
  }

  if (workerGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Clock className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-900 text-lg font-bold">Trống lịch trình</p>
          <p className="text-slate-400 text-sm mt-1">
            Không có công việc nào được phân công trong ngày {format(currentDate, "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>
    );
  }

  const isToday = isSameDay(currentDate, new Date());
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="flex flex-col flex-1 h-full bg-white overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="min-w-[1200px] min-h-full flex flex-col">
        {/* Timeline Header */}
        <div className="bg-slate-50/50 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-sm">
          <div className="grid grid-cols-[200px_1fr] md:grid-cols-[300px_1fr]">
            <div className="p-4 border-r border-slate-200 flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Nhân sự / Khu vực
              </span>
            </div>

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
                    className={`p-3 text-center border-r border-slate-200/60 last:border-r-0 relative flex flex-col items-center justify-center ${
                      isCurrentHour ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div
                      className={`text-[11px] font-bold tracking-wide ${
                        isCurrentHour ? "text-primary bg-primary/10 px-2 py-0.5 rounded-full" : "text-slate-500"
                      }`}
                    >
                      {hour}:00
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Worker Rows */}
        <div className="divide-y divide-slate-100">
          {workerGroups.map((worker, index) => {
            const tasksForWorker = getTasksForWorker(worker);
            const completedTasks = worker.tasks.filter(
              (t) => t.status === "Completed",
            ).length;
            const totalTasks = worker.tasks.length;

            return (
              <div
                key={worker.assigneeId}
                className="grid group transition-colors hover:bg-slate-50/50 grid-cols-[200px_1fr] md:grid-cols-[300px_1fr]"
              >
                {/* Worker Info */}
                <div className="p-5 border-r border-slate-200 bg-white group-hover:bg-transparent transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-200">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-bold">
                        {worker.assigneeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {worker.assigneeName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        {worker.location.split(",")[0]}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
                          <span className="text-[10px] font-bold text-slate-600">{totalTasks} công việc</span>
                        </div>
                        {completedTasks > 0 && (
                          <div className="flex items-center gap-1.5 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100/60">
                            <span className="text-[10px] font-bold text-emerald-700">{completedTasks} hoàn thành</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative min-h-[120px] py-4 bg-slate-50/20">
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
                          className={`border-r border-slate-200/30 last:border-r-0 relative ${
                            isCurrentHour ? "bg-primary/5" : ""
                          }`}
                        >
                          {isCurrentHour && (
                            <div 
                              className="absolute top-0 bottom-0 w-[1.5px] bg-primary z-20 pointer-events-none" 
                              style={{ left: `${(currentMinute / 60) * 100}%` }}
                            >
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(var(--primary),0.2)]"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tasks Container */}
                  <div className="relative h-full px-4">
                    {tasksForWorker.map(({ task, position }, taskIndex) => (
                      <div
                        key={task.id}
                        className="absolute"
                        style={{
                          left: position.left,
                          width: position.width,
                          top: `${taskIndex * 36 + 4}px`,
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
