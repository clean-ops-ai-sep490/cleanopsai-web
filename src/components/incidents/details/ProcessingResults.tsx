"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { TaskAssignment } from "@/types/task-assignment";
import type { TaskActionResult } from "@/hooks/useEmergencyLeaveActions";

interface ProcessingResultsProps {
  results: TaskActionResult[];
  affectedTasks: TaskAssignment[];
}

export function ProcessingResults({ results, affectedTasks }: ProcessingResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500 mb-2">Kết quả xử lý</p>
      {results.map((r) => {
        const task = affectedTasks.find((t) => t.id === r.taskId);
        return (
          <div
            key={r.taskId}
            className={`flex items-center gap-2 text-xs ${r.success ? "text-emerald-600" : "text-rose-500"}`}
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
  );
}
