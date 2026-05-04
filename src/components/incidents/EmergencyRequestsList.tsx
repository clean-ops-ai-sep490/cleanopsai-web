"use client";

import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  AlertTriangle,
  ChevronRight,
  Headphones,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { requestStatusConfig } from "./constants";
import type { EmergencyLeaveRequest } from "@/lib/emergency-leave-request-api";

interface EmergencyRequestsListProps {
  requests: EmergencyLeaveRequest[];
  selectedRequestId: string | null;
  onSelect: (request: EmergencyLeaveRequest) => void;
  processingId?: string | null;
}

const EMPTY_DATE_PREFIX = "0001-01-01";

function isValidApiDate(value: string | null | undefined) {
  return Boolean(value && !value.startsWith(EMPTY_DATE_PREFIX));
}

function formatDateShort(dateStr: string) {
  if (!isValidApiDate(dateStr)) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Pending":
      return { dot: "bg-amber-400", text: "text-amber-600", label: "Chờ duyệt" };
    case "Approved":
      return { dot: "bg-emerald-400", text: "text-emerald-600", label: "Đã duyệt" };
    case "Rejected":
      return { dot: "bg-red-400", text: "text-red-500", label: "Từ chối" };
    default:
      return { dot: "bg-gray-300", text: "text-gray-500", label: status };
  }
}

export function EmergencyRequestsListPanel({
  requests,
  selectedRequestId,
  onSelect,
  processingId,
}: EmergencyRequestsListProps) {
  // Sort: Pending first, then by date desc
  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (b.status === "Pending" && a.status !== "Pending") return 1;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  return (
    <div>
      {sortedRequests.map((req, idx) => {
        const statusStyle = getStatusStyle(req.status);
        const isSelected = selectedRequestId === req.id;
        const isProcessing = processingId === req.id;
        const isPending = req.status === "Pending";

        return (
          <div
            key={req.id}
            onClick={() => !isProcessing && onSelect(req)}
            className={`
              group relative cursor-pointer px-5 py-3.5 transition-all duration-150
              ${isSelected
                ? "bg-primary/[0.04]"
                : "hover:bg-gray-50/60"
              }
              ${idx < sortedRequests.length - 1 ? "border-b border-gray-50" : ""}
              ${isProcessing ? "pointer-events-none opacity-50" : ""}
            `}
          >
            {/* Selected indicator */}
            {isSelected && (
              <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
            )}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                  isPending
                    ? "bg-amber-50 text-amber-600"
                    : req.status === "Approved"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-50 text-gray-400"
                }`}
              >
                {req.workerName?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`truncate text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                    {req.workerName || "Không rõ"}
                  </p>
                  <span className={`flex items-center gap-1 text-[10px] font-medium ${statusStyle.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                    {statusStyle.label}
                  </span>
                </div>

                {/* Date range */}
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <CalendarRange className="h-3 w-3 shrink-0" />
                  <span>
                    {formatDateShort(req.leaveDateFrom)} — {formatDateShort(req.leaveDateTo)}
                  </span>
                  {req.audioUrl && <Headphones className="h-3 w-3 ml-auto text-gray-300" />}
                </p>

                {/* Transcription preview */}
                {req.transcription && (
                  <p className="mt-1 truncate text-[11px] text-gray-300 italic">
                    {req.transcription}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
