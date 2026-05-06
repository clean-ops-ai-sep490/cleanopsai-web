"use client";

import { CheckCircle2, AlertTriangle, RotateCcw, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  isPending: boolean;
  hasFailures: boolean;
  submitting: boolean;
  canApprove: boolean;
  pendingActionsCount: number;
  reassignMissingWorkerCount: number;
  onApprove: () => void;
  onReject: () => void;
  onRetryFailed: () => void;
}

export function ActionBar({
  isPending,
  hasFailures,
  submitting,
  canApprove,
  pendingActionsCount,
  reassignMissingWorkerCount,
  onApprove,
  onReject,
  onRetryFailed,
}: ActionBarProps) {
  if (!isPending) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-8 mt-10">
      {/* Status text */}
      <div className="text-[13px] font-medium">
        {pendingActionsCount === 0 ? (
          <span className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Sẵn sàng để duyệt
            {reassignMissingWorkerCount > 0 && (
              <span className="text-amber-500 ml-1 font-normal">
                ({reassignMissingWorkerCount} task chưa chọn người)
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-slate-400">
            <AlertTriangle className="h-4 w-4" />
            Còn {pendingActionsCount} task chưa xử lý
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {hasFailures && (
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-500 hover:bg-amber-50"
            onClick={onRetryFailed}
            disabled={submitting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        )}
        <Button
          variant="outline"
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={onReject}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Từ chối
        </Button>
        <Button
          className="shadow-none"
          onClick={onApprove}
          disabled={!canApprove}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Duyệt yêu cầu
        </Button>
      </div>
    </div>
  );
}
