"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Clock,
  Headphones,
  Loader2,
  MapPin,
  RotateCcw,
  User,
  UserCheck,
  Users,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Play,
  Pause,
} from "lucide-react";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";
import type { TaskAssignment } from "@/types/task-assignment";
import type { Worker } from "@/lib/worker-api";
import type {
  TaskAction,
  TaskDecision,
  TaskActionResult,
} from "@/hooks/useEmergencyLeaveActions";

interface EmergencyRequestDetailProps {
  request: EmergencyLeaveRequest;
  affectedTasks: TaskAssignment[];
  loadingTasks: boolean;
  decisions: Record<string, TaskDecision>;
  availableWorkers: Record<string, Worker[]>;
  loadingWorkers: Record<string, boolean>;
  submitting: boolean;
  results: TaskActionResult[];
  onApprove: () => void;
  onReject: () => void;
  onRetryFailed: () => void;
  onSetAction: (taskId: string, action: TaskAction) => void;
  onSetWorker: (taskId: string, worker: Worker | null) => void;
  onFetchWorkers: (task: TaskAssignment) => void;
  onBulkAction: (action: TaskAction) => void;
}

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatDateTime(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getShortLocation(loc: string | null | undefined): string {
  if (!loc) return "—";
  const parts = loc.split(",").map((p) => p.trim());
  if (parts.length <= 3) return loc;
  return parts.slice(-3).join(", ");
}

const taskStatusStyles: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  Block: { label: "Bị chặn", dot: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
  NotStarted: { label: "Chưa bắt đầu", dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50" },
  InProgress: { label: "Đang thực hiện", dot: "bg-blue-400", text: "text-blue-600", bg: "bg-blue-50" },
  Completed: { label: "Hoàn thành", dot: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50" },
  Cancelled: { label: "Đã hủy", dot: "bg-gray-300", text: "text-gray-400", bg: "bg-gray-50" },
};

export function EmergencyRequestDetail({
  request,
  affectedTasks,
  loadingTasks,
  decisions,
  availableWorkers,
  loadingWorkers,
  submitting,
  results,
  onApprove,
  onReject,
  onRetryFailed,
  onSetAction,
  onSetWorker,
  onFetchWorkers,
  onBulkAction,
}: EmergencyRequestDetailProps) {
  const isPending = request.status === "Pending";
  const blockTasks = affectedTasks.filter((t) => t.status === "Block");
  const otherTasks = affectedTasks.filter((t) => t.status !== "Block");
  const hasFailures = results.some((r) => !r.success);

  const allBlockTasksHandled = blockTasks.every((t) => decisions[t.id]?.action);
  const reassignMissingWorker = blockTasks.filter(
    (t) =>
      (decisions[t.id]?.action === "REASSIGN_START" ||
        decisions[t.id]?.action === "REASSIGN_LATER") &&
      !decisions[t.id]?.selectedWorker,
  );

  const canApprove =
    isPending && allBlockTasksHandled && reassignMissingWorker.length === 0 && !submitting;

  return (
    <div className="space-y-6">
      {/* ─── 1. Request Header ─── */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Worker Avatar */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a80a2]/10 to-[#1a80a2]/5 text-sm font-bold text-primary">
              {request.workerName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {request.workerName}
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                <CalendarRange className="h-3 w-3" />
                <span>
                  {formatDateTime(request.leaveDateFrom)}
                  <ArrowRight className="inline mx-1 h-3 w-3 text-gray-300" />
                  {formatDateTime(request.leaveDateTo)}
                </span>
              </div>
            </div>
          </div>

          {/* Audio button */}
          {request.audioUrl && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" asChild>
              <a href={request.audioUrl} target="_blank" rel="noreferrer">
                <Headphones className="h-3.5 w-3.5" />
                Audio
              </a>
            </Button>
          )}
        </div>

        {/* Reason */}
        {request.transcription && (
          <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-300 mb-1">Lý do</p>
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{request.transcription}"
            </p>
          </div>
        )}

        {request.reviewedByUserName && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-300">
            <UserCheck className="h-3 w-3" />
            Đã review: {request.reviewedByUserName}
          </p>
        )}
      </div>

      {/* ─── 2. Impact Stats ─── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={blockTasks.length} label="Bị chặn" color="red" />
        <StatCard value={otherTasks.length} label="Task khác" color="gray" />
        <StatCard value={affectedTasks.length} label="Tổng" color="blue" />
      </div>

      {/* ─── 3. Task List ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            Task bị ảnh hưởng
          </h4>
          {isPending && blockTasks.length > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-gray-500 hover:text-primary"
                onClick={() => onBulkAction("REASSIGN_START")}
              >
                Giao lại tất cả
              </Button>
              <span className="text-gray-200">|</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] text-gray-500 hover:text-primary"
                onClick={() => onBulkAction("KEEP_CONTINUE")}
              >
                Giữ tất cả
              </Button>
            </div>
          )}
        </div>

        {loadingTasks ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            <span className="ml-2 text-sm text-gray-400">Đang tải...</span>
          </div>
        ) : affectedTasks.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-300">
            Không có task bị ảnh hưởng
          </div>
        ) : (
          <div className="space-y-2">
            {blockTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                decision={decisions[task.id]}
                workers={availableWorkers[task.id] || []}
                loadingWorker={loadingWorkers[task.id] || false}
                disabled={!isPending || submitting}
                result={results.find((r) => r.taskId === task.id)}
                onSetAction={(action) => onSetAction(task.id, action)}
                onSetWorker={(worker) => onSetWorker(task.id, worker)}
                onFetchWorkers={() => onFetchWorkers(task)}
              />
            ))}
            {otherTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                decision={decisions[task.id]}
                workers={[]}
                loadingWorker={false}
                disabled={true}
                onSetAction={() => {}}
                onSetWorker={() => {}}
                onFetchWorkers={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Action Bar ─── */}
      {isPending && (
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3.5">
          {/* Status text */}
          <div className="text-xs">
            {blockTasks.length > 0 ? (
              allBlockTasksHandled ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Tất cả task đã xử lý
                  {reassignMissingWorker.length > 0 && (
                    <span className="text-amber-500 ml-1">
                      ({reassignMissingWorker.length} chưa chọn worker)
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Còn {blockTasks.length - blockTasks.filter((t) => decisions[t.id]?.action).length} task chưa xử lý
                </span>
              )
            ) : (
              <span className="text-gray-400">Không có task bị chặn</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {hasFailures && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-amber-500 hover:text-amber-600"
                onClick={onRetryFailed}
                disabled={submitting}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Thử lại
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={onReject}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="mr-1 h-3.5 w-3.5" />
              )}
              Từ chối
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary hover:bg-[#156b88] text-white"
              onClick={onApprove}
              disabled={!canApprove}
            >
              {submitting ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              )}
              Duyệt
            </Button>
          </div>
        </div>
      )}

      {/* ─── 5. Results ─── */}
      {results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 mb-2">Kết quả xử lý</p>
          {results.map((r) => {
            const task = affectedTasks.find((t) => t.id === r.taskId);
            return (
              <div
                key={r.taskId}
                className={`flex items-center gap-2 text-xs ${r.success ? "text-emerald-600" : "text-red-500"}`}
              >
                {r.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                <span className="truncate">
                  {task?.taskName || task?.nameAdhocTask || `#${r.taskId.slice(-6)}`}
                  {" — "}
                  {r.success ? "Thành công" : r.error || "Thất bại"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ value, label, color }: { value: number; label: string; color: "red" | "gray" | "blue" }) {
  const colors = {
    red: { bg: "bg-red-50/60", text: "text-red-600", subtext: "text-red-400" },
    gray: { bg: "bg-gray-50/60", text: "text-gray-600", subtext: "text-gray-400" },
    blue: { bg: "bg-primary/5", text: "text-primary", subtext: "text-primary/60" },
  };
  const c = colors[color];

  return (
    <div className={`rounded-xl ${c.bg} px-4 py-3 text-center`}>
      <p className={`text-xl font-bold tabular-nums ${c.text}`}>{value}</p>
      <p className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${c.subtext}`}>{label}</p>
    </div>
  );
}

/* ─── Task Card ─── */
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
}

function TaskCard({
  task,
  decision,
  workers,
  loadingWorker,
  disabled,
  result,
  onSetAction,
  onSetWorker,
  onFetchWorkers,
}: TaskCardProps) {
  const isBlock = task.status === "Block";
  const st = taskStatusStyles[task.status] || {
    label: task.status,
    dot: "bg-gray-300",
    text: "text-gray-500",
    bg: "bg-gray-50",
  };

  const currentAction = decision?.action;
  const needsWorker = currentAction === "REASSIGN_START" || currentAction === "REASSIGN_LATER";
  const selectedWorker = decision?.selectedWorker;

  // Auto-fetch workers when reassign action is selected
  // Track which action we last fetched for to prevent duplicate calls
  const fetchedForAction = useRef<TaskAction | undefined>(undefined);

  useEffect(() => {
    if (needsWorker && workers.length === 0 && !loadingWorker && fetchedForAction.current !== currentAction) {
      fetchedForAction.current = currentAction;
      onFetchWorkers();
    }
  }, [currentAction, needsWorker, workers.length, loadingWorker, onFetchWorkers]);

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 transition-all ${
        isBlock
          ? "border-red-100 bg-red-50/30"
          : "border-gray-100 bg-gray-50/30"
      } ${
        result?.success === false
          ? "ring-1 ring-red-200 bg-red-50/40"
          : result?.success === true
            ? "ring-1 ring-emerald-200 bg-emerald-50/20"
            : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Task Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800 truncate">
              {task.taskName || task.nameAdhocTask || `Task #${task.id.slice(-6)}`}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${st.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {result && (
              <span className={`text-[10px] font-semibold ${result.success ? "text-emerald-500" : "text-red-500"}`}>
                {result.success ? "✓" : "✗"}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(task.scheduledStartAt)} - {formatTime(task.scheduledEndAt)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {getShortLocation(task.displayLocation)}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assigneeName}
            </span>
          </div>

          {/* Suggestion hint */}
          {isBlock && !currentAction && !disabled && (
            <p className="mt-2 text-[10px] text-amber-500 flex items-center gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              Gợi ý: Giao lại & Bắt đầu ngay
            </p>
          )}
        </div>

        {/* Action Controls */}
        {isBlock && !disabled && (
          <div className="shrink-0 space-y-2 w-52">
            <Select
              value={currentAction || ""}
              onValueChange={(val: string) => onSetAction(val as TaskAction)}
            >
              <SelectTrigger className="h-8 text-xs border-gray-200">
                <SelectValue placeholder="Chọn hành động..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REASSIGN_START">
                  <span className="flex items-center gap-1.5">
                    <Play className="h-3 w-3 text-emerald-500" />
                    Giao lại & Bắt đầu ngay
                  </span>
                </SelectItem>
                <SelectItem value="REASSIGN_LATER">
                  <span className="flex items-center gap-1.5">
                    <Pause className="h-3 w-3 text-blue-500" />
                    Giao lại & Chờ bắt đầu
                  </span>
                </SelectItem>
                <SelectItem value="KEEP_CONTINUE">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-gray-500" />
                    Giữ & Tiếp tục
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Worker picker */}
            {needsWorker && (
              <div>
                {loadingWorker ? (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 py-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tải...
                  </div>
                ) : (
                  <Select
                    value={selectedWorker?.id || ""}
                    onValueChange={(val) => {
                      const w = workers.find((w) => w.id === val);
                      onSetWorker(w || null);
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs border-gray-200">
                      <SelectValue placeholder="Chọn worker..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-400">
                          Không có worker khả dụng
                        </div>
                      ) : (
                        workers.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            <span className="flex items-center gap-2">
                              {w.avatarUrl ? (
                                <img
                                  src={w.avatarUrl}
                                  alt={w.fullName}
                                  className="h-5 w-5 rounded-md object-cover shrink-0"
                                />
                              ) : (
                                <div className="h-5 w-5 rounded-md bg-emerald-50 flex items-center justify-center text-[9px] font-semibold text-emerald-600 shrink-0">
                                  {w.fullName.charAt(0)}
                                </div>
                              )}
                              <span className="truncate">{w.fullName}</span>
                              {(w.totalSkills ?? 0) > 0 && (
                                <span className="ml-auto text-[9px] text-gray-300 shrink-0">
                                  {w.totalSkills} kỹ năng
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}

                {selectedWorker && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {selectedWorker.avatarUrl ? (
                      <img
                        src={selectedWorker.avatarUrl}
                        alt={selectedWorker.fullName}
                        className="h-4 w-4 rounded object-cover"
                      />
                    ) : (
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                    )}
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {selectedWorker.fullName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {currentAction === "KEEP_CONTINUE" && (
              <p className="text-[10px] text-gray-400 italic">
                Worker hiện tại sẽ tiếp tục
              </p>
            )}
          </div>
        )}

        {/* Disabled state */}
        {(!isBlock || disabled) && (
          <div className="shrink-0 w-52 text-right">
            <span className="text-[11px] text-gray-300">
              {isBlock && disabled ? "Đang xử lý..." : "Không cần xử lý"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
