import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { IssueReport } from "./types";

interface IssueReportsTableProps {
  issues: IssueReport[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateTaskStatus?: (taskAssignmentId: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  Open: { label: "Mở", dot: "bg-amber-400", text: "text-amber-700" },
  InProgress: { label: "Đang xử lý", dot: "bg-blue-400", text: "text-blue-700" },
  Resolved: { label: "Đã giải quyết", dot: "bg-emerald-400", text: "text-emerald-700" },
  Closed: { label: "Đóng", dot: "bg-gray-300", text: "text-gray-500" },
  Pending: { label: "Chờ xử lý", dot: "bg-amber-400", text: "text-amber-700" },
  Approved: { label: "Đã duyệt", dot: "bg-emerald-400", text: "text-emerald-700" },
  Rejected: { label: "Đã từ chối", dot: "bg-red-400", text: "text-red-600" },
};

export function IssueReportsTable({
  issues,
  onApprove,
  onReject,
  onUpdateTaskStatus,
  isLoading = false,
}: IssueReportsTableProps) {
  const getShortLocation = (
    displayLocation: string | null | undefined,
  ): string => {
    if (!displayLocation) return "—";
    const parts = displayLocation.split(",").map((p) => p.trim());
    if (parts.length <= 3) return displayLocation;
    return parts.slice(-3).join(", ");
  };

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
          <FileText className="h-5 w-5 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-400">Chưa có báo cáo sự cố</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      {/* Table Header */}
      <div
        className="grid items-center gap-4 border-b border-gray-100 bg-gray-50/60 px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400"
        style={{ gridTemplateColumns: "2fr 1fr 1.5fr 100px 90px 120px" }}
      >
        <span>Sự cố</span>
        <span>Người báo cáo</span>
        <span>Vị trí</span>
        <span className="text-center">Trạng thái</span>
        <span className="text-center">Ngày</span>
        <span className="text-center">Hành động</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-50">
        {issues.map((issue) => {
          const st = statusConfig[issue.status] || {
            label: issue.status,
            dot: "bg-gray-300",
            text: "text-gray-500",
          };

          return (
            <div
              key={issue.id}
              className="grid items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50/40"
              style={{ gridTemplateColumns: "2fr 1fr 1.5fr 100px 90px 120px" }}
            >
              {/* Issue Info */}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  #{issue.id?.slice(-6) || "N/A"}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {issue.description || "Không có mô tả"}
                </p>
              </div>

              {/* Reporter */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500">
                  {(issue.reportedByWorkerName || issue.worker || "?").charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm text-gray-600">
                  {issue.reportedByWorkerName || issue.worker || "Không rõ"}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 min-w-0 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                <span className="truncate">{getShortLocation(issue.displayLocation)}</span>
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>

              {/* Date */}
              <div className="text-center text-xs tabular-nums text-gray-400">
                {issue.created
                  ? new Date(issue.created).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                  : issue.createdAt || "—"}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                {issue.status === "Pending" || issue.status === "Open" ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => onApprove?.(issue.id)}
                      disabled={isLoading}
                      title="Phê duyệt"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => onReject?.(issue.id)}
                      disabled={isLoading}
                      title="Từ chối"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                ) : (issue.status === "Approved" || issue.status === "Rejected") &&
                  issue.taskAssignmentId ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-xs text-primary hover:text-[#156b88] hover:bg-primary/5"
                    onClick={() => onUpdateTaskStatus?.(issue.taskAssignmentId!)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Cập nhật
                  </Button>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
