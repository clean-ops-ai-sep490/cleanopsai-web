"use client";

import { useEffect, useRef } from "react";
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

  // Convert ISO to datetime-local compatible format (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoStr?: string) => {
    if (!isoStr) return "";
    return isoStr.substring(0, 16);
  };

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
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Bắt đầu điều phối</label>
                <Input
                  type="datetime-local"
                  className="h-10 text-sm bg-white border-slate-200"
                  value={formatForInput(decision?.scheduledStartAt)}
                  onChange={(e) => onUpdateDecision({ scheduledStartAt: e.target.value + ":00Z" })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Thời lượng (phút)</label>
                <Input
                  type="number"
                  className="h-10 text-sm bg-white border-slate-200"
                  value={decision?.durationMinutes ?? 0}
                  onChange={(e) => onUpdateDecision({ durationMinutes: parseInt(e.target.value) || 0 })}
                />
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
                    Giao lại (Giữ InProgress)
                  </span>
                </SelectItem>
                <SelectItem value="REASSIGN_LATER">
                  <span className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-blue-500" />
                    Giao lại (Đặt về NotStarted)
                  </span>
                </SelectItem>
                <SelectItem value="KEEP_CONTINUE">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    Giữ nguyên & Tiếp tục
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

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
