import { Loader2, RefreshCcw } from "lucide-react";

export const statusLabels: Record<string, string> = {
  QUEUED: "Đang chờ",
  INPROGRESS: "Đang xử lý",
  SUBMITTED: "Đã gửi",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  RUNNING: "Đang chạy",
  FAILED: "Thất bại",
  PROMOTED: "Đã đưa vào sử dụng",
  PASS: "Đạt",
  FAIL: "Không đạt",
  PENDING: "Chờ duyệt",
};

export function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleString("vi-VN");
}

export function statusBadgeClass(status: string) {
  if (["APPROVED", "PROMOTED", "PASS"].includes(status)) {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (["FAILED", "REJECTED", "FAIL"].includes(status)) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (["RUNNING", "INPROGRESS", "PENDING"].includes(status)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex min-h-[180px] items-center justify-center ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-[#1a80a2]" />
    </div>
  );
}

export function RefreshIcon({ isFetching }: { isFetching: boolean }) {
  return isFetching ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#1a80a2]" />
  ) : (
    <RefreshCcw className="mr-2 h-4 w-4" />
  );
}

export function formatMetric(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Chưa có";
  }

  return value.toFixed(4);
}

export function formatBenchmarkPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
