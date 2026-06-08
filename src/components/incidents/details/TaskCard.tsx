"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  Play, 
  Pause, 
  ArrowRight, 
  Loader2, 
  UserCheck 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { StatusBadge } from "@/components/ui/status-badge";
import type { TaskAssignment } from "@/types/task-assignment";
import type { Worker } from "@/lib/worker-api";
import type { TaskAction, TaskDecision, TaskActionResult } from "@/hooks/useEmergencyLeaveActions";

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatTime(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  const timePart = dateStr.split("T")[1];
  return timePart ? timePart.substring(0, 5) : "—";
}

function getShortLocation(loc: string | null | undefined): string {
  if (!loc) return "—";
  const parts = loc.split(",").map((p) => p.trim());
  if (parts.length <= 3) return loc;
  return parts.slice(-3).join(", ");
}

interface TaskCardProps {
  task: TaskAssignment;
  decision: TaskDecision | undefined;
  workers: Worker[];
  loadingWorker: boolean;
  disabled: boolean;
  result?: TaskActionResult;
  onSetAction: (action: TaskAction) => void;
  onSetWorker: (worker: Worker | null) => void;
  onFetchWorkers: () => void;
  onUpdateDecision: (updates: Partial<TaskDecision>) => void;
}

export function TaskCard({
  task,
  decision,
  workers,
  loadingWorker,
  disabled,
  result,
  onSetAction,
  onSetWorker,
  onFetchWorkers,
  onUpdateDecision,
}: TaskCardProps) {
  const needsAction = task.status !== "Completed" && task.status !== "Cancelled";
  const isBlock = task.status === "Block";

  const currentAction = decision?.action;
  const needsWorker = currentAction === "REASSIGN_START" || currentAction === "REASSIGN_LATER";
  const selectedWorker = decision?.selectedWorker;

  const fetchedForAction = useRef<TaskAction | undefined>(undefined);

  useEffect(() => {
    if (needsWorker && workers.length === 0 && !loadingWorker && fetchedForAction.current !== currentAction) {
      fetchedForAction.current = currentAction;
      onFetchWorkers();
    }
  }, [currentAction, needsWorker, workers.length, loadingWorker, onFetchWorkers]);



  return (
    <div
      className={`border-b border-slate-100 py-6 last:border-0 ${
        result?.success === false
          ? "bg-rose-50/30"
          : result?.success === true
            ? "bg-emerald-50/10"
            : ""
      }`}
    >
      <div className="flex items-start justify-between gap-10">
        {/* Task Info */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <p className="text-base font-semibold text-slate-900">
              {task.taskName || task.nameAdhocTask || `Task #${task.id.slice(-6)}`}
            </p>
            <StatusBadge status={task.status} />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[13px] text-slate-500">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-300" />
              {formatTime(task.scheduledStartAt)} - {formatTime(task.scheduledEndAt)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-300" />
              {getShortLocation(task.displayLocation)}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-300" />
              {task.assigneeName}
            </span>
          </div>

          {/* Inline Edit Fields */}
          {currentAction && !disabled && (
            <div className="space-y-4 pt-5 border-t border-slate-100 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block ml-1">Ngày bắt đầu điều phối</label>
                  <DatePicker
                    className="text-xs"
                    date={decision?.scheduledStartAt ? new Date(decision.scheduledStartAt.split('T')[0]) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const currentTime = (decision?.scheduledStartAt || task.scheduledStartAt).split('T')[1] || "00:00:00Z";
                      onUpdateDecision({ scheduledStartAt: `${dateStr}T${currentTime}` });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block ml-1">Giờ bắt đầu</label>
                  <TimePicker
                    value={(decision?.scheduledStartAt || task.scheduledStartAt).split('T')[1]?.substring(0, 5)}
                    onChange={(time) => {
                      const currentDate = (decision?.scheduledStartAt || task.scheduledStartAt).split('T')[0];
                      onUpdateDecision({ scheduledStartAt: `${currentDate}T${time}:00Z` });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] block ml-1">Thời lượng (phút)</label>
                  <Input
                    type="number"
                    className="h-10 text-xs bg-white border-slate-200 px-3"
                    value={decision?.durationMinutes ?? 0}
                    onChange={(e) => onUpdateDecision({ durationMinutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion hint */}
          {isBlock && !currentAction && !disabled && (
            <div className="flex items-center gap-2 text-[12px] text-amber-600 font-medium pt-2">
              <AlertTriangle className="h-4 w-4" />
              Cần xử lý để gỡ chặn hệ thống
            </div>
          )}
        </div>

        {/* Action Controls */}
        {needsAction && !disabled && (
          <div className="shrink-0 space-y-4 w-72">
            <Select
              value={currentAction || ""}
              onValueChange={(val: string) => onSetAction(val as TaskAction)}
            >
              <SelectTrigger className="h-11 text-sm border-slate-200 bg-white">
                <SelectValue placeholder="Chọn phương án..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REASSIGN_START">
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-emerald-500" />
                    Bàn giao & Làm tiếp
                  </span>
                </SelectItem>
                <SelectItem value="REASSIGN_LATER">
                  <span className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-blue-500" />
                    Giao mới & Chờ làm
                  </span>
                </SelectItem>
                <SelectItem value="KEEP_CONTINUE">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    Xử lý sau
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Warning block for KEEP_CONTINUE */}
            {currentAction === "KEEP_CONTINUE" && (
              <div className="flex items-start gap-2 text-[12px] text-amber-600 font-medium pl-1 leading-normal">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Task này vẫn giao cho worker xin nghỉ. Bạn cần bố trí xử lý sau.</span>
              </div>
            )}

            {/* Worker picker */}
            {needsWorker && (
              <div className="space-y-3">
                {loadingWorker ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-3 italic">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tìm worker khả dụng...
                  </div>
                ) : (
                  <Select
                    value={selectedWorker?.id || ""}
                    onValueChange={(val) => {
                      const w = workers.find((w) => w.id === val);
                      onSetWorker(w || null);
                    }}
                  >
                    <SelectTrigger className="h-11 text-sm border-slate-200 bg-white">
                      <SelectValue placeholder="Chọn người thay thế..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.length === 0 ? (
                        <div className="px-4 py-4 text-center text-sm text-slate-400">
                          Không có worker khả dụng
                        </div>
                      ) : (
                        workers.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            <div className="flex items-center gap-3">
                              <Avatar size="sm">
                                <AvatarImage src={w.avatarUrl} />
                                <AvatarFallback>{w.fullName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="truncate font-medium">{w.fullName}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}

                {selectedWorker && !loadingWorker && (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-600 font-medium pl-1">
                    <UserCheck className="h-4 w-4" />
                    Giao cho: {selectedWorker.fullName}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Disabled state */}
        {(!needsAction || disabled) && (
          <div className="shrink-0 w-72 text-right">
            <div className="text-[13px] text-slate-400 font-medium">
              {disabled ? (
                <span className="flex items-center justify-end gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                "Hệ thống tự động xử lý"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
