"use client";

import { Loader2, ShieldAlert, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";
import type { TaskAssignment } from "@/types/task-assignment";
import type { Worker } from "@/lib/worker-api";
import type {
  TaskAction,
  TaskDecision,
  TaskActionResult,
} from "@/hooks/useEmergencyLeaveActions";

// SRP Refactored Sub-components
import { RequestInfo } from "./details/RequestInfo";
import { ImpactStats } from "./details/ImpactStats";
import { TaskCard } from "./details/TaskCard";
import { ActionBar } from "./details/ActionBar";
import { ProcessingResults } from "./details/ProcessingResults";

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
  onUpdateDecision: (taskId: string, updates: Partial<TaskDecision>) => void;
}

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
  onUpdateDecision,
}: EmergencyRequestDetailProps) {
  const isPending = request.status === "Pending";
  const hasFailures = results.some((r) => !r.success);

  const allTasksHandled = affectedTasks.every((t) => decisions[t.id]?.action);
  const reassignMissingWorker = affectedTasks.filter(
    (t) =>
      (decisions[t.id]?.action === "REASSIGN_START" ||
        decisions[t.id]?.action === "REASSIGN_LATER") &&
      !decisions[t.id]?.selectedWorker,
  );

  const canApprove =
    isPending && allTasksHandled && reassignMissingWorker.length === 0 && !submitting;

  const inProgressCount = affectedTasks.filter((t) => t.status === "InProgress").length;

  return (
    <div className="space-y-8 pb-10">
      {/* ─── 1. Request Info Header ─── */}
      <RequestInfo request={request} />

      {/* ─── 2. Impact Stats ─── */}
      <ImpactStats inProgressCount={inProgressCount} totalCount={affectedTasks.length} />

      {/* ─── 3. Task List ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 border border-rose-100 shadow-sm">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
              Danh sách Task bị ảnh hưởng
            </h4>
          </div>
          
          {isPending && affectedTasks.length > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all"
                onClick={() => onBulkAction("REASSIGN_START")}
              >
                Giao lại tất cả
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all"
                onClick={() => onBulkAction("KEEP_CONTINUE")}
              >
                Giữ tất cả
              </Button>
            </div>
          )}
        </div>

        {loadingTasks ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <p className="text-sm font-medium text-slate-400">Đang phân tích dữ liệu task...</p>
          </div>
        ) : affectedTasks.length === 0 ? (
          <EmptyState 
            title="Không tìm thấy task" 
            description="Worker không có bất kỳ công việc nào trong khung giờ nghỉ phép đã đăng ký."
            icon={<Inbox className="h-6 w-6" />}
          />
        ) : (
          <div className="space-y-3">
            {affectedTasks.map((task) => (
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
                onUpdateDecision={(updates) => onUpdateDecision(task.id, updates)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Action Bar ─── */}
      <ActionBar
        isPending={isPending}
        hasFailures={hasFailures}
        submitting={submitting}
        canApprove={canApprove}
        pendingActionsCount={affectedTasks.length - affectedTasks.filter((t) => decisions[t.id]?.action).length}
        reassignMissingWorkerCount={reassignMissingWorker.length}
        onApprove={onApprove}
        onReject={onReject}
        onRetryFailed={onRetryFailed}
      />

      {/* ─── 5. Results ─── */}
      <ProcessingResults results={results} affectedTasks={affectedTasks} />
    </div>
  );
}
