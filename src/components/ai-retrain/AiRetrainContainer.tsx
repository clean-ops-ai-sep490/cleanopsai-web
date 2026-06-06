"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { segmentationBenchmarkDataset } from "@/lib/ai-benchmark-data";
import { toastUtils } from "@/lib/utils/toast-utils";
import { UserRole, useRole } from "@/hooks/useRole";
import {
  useAnnotationCandidates,
  usePendingScoringReviews,
  useRetrainBatches,
  useReviewScoringResult,
  useTriggerRetrainBatch,
} from "@/hooks/useScoringRetrain";
import type {
  PendingScoringReviewItem,
  ScoringAnnotationCandidateListItem,
  TriggerScoringRetrainRequest,
} from "@/types/scoring";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  GitBranch,
  Loader2,
  Play,
  RefreshCcw,
  XCircle,
} from "lucide-react";

const statusLabels: Record<string, string> = {
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

const trainingConfigLabels: Record<string, string> = {
  epochs: "Số vòng huấn luyện",
  batch: "Kích thước lô",
  imgsz: "Kích thước ảnh",
  workers: "Số tiến trình xử lý",
  device: "Thiết bị",
  half: "Dùng FP16",
  encoder: "Bộ mã hóa",
  encoder_weights: "Trọng số bộ mã hóa",
  lr: "Tốc độ học",
};

type RetrainTab = "data" | "training" | "quality";
type DataQueueStatusFilter =
  | "all"
  | "action-needed"
  | "submitted"
  | "approved"
  | "rejected";

const DATA_QUEUE_PAGE_SIZE = 5;
const BENCHMARK_GALLERY_PAGE_SIZE = 6;

type UnifiedDataQueueItem =
  | {
      key: string;
      type: "review";
      imageUrl: string;
      environmentKey: string;
      createdAt: string;
      review: PendingScoringReviewItem;
    }
  | {
      key: string;
      type: "annotation";
      imageUrl: string;
      environmentKey: string;
      createdAt: string;
      annotation: ScoringAnnotationCandidateListItem;
    };

const dataQueueStatusFilters: Array<{
  value: DataQueueStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "action-needed", label: "Cần xử lý" },
  { value: "submitted", label: "Đã gửi" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
];

function parseRetrainTab(value?: string | null): RetrainTab {
  if (value === "training" || value === "runs") {
    return "training";
  }

  if (value === "quality" || value === "benchmark" || value === "models") {
    return "quality";
  }

  return "data";
}

const workflowSteps: Array<{
  value: RetrainTab;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: "data",
    title: "Dữ liệu",
    description: "Duyệt ảnh và chuẩn bị nhãn chuẩn",
    icon: CheckCircle2,
  },
  {
    value: "training",
    title: "Huấn luyện",
    description: "Kích hoạt và theo dõi phiên chạy",
    icon: GitBranch,
  },
  {
    value: "quality",
    title: "Đánh giá",
    description: "Kiểm tra chất lượng trước khi sử dụng",
    icon: BarChart3,
  },
];

function workflowTabClass(isActive: boolean) {
  return [
    "flex h-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
    isActive
      ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680] shadow-sm"
      : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50 hover:text-gray-900",
  ].join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleString("vi-VN");
}

function statusBadgeClass(status: string) {
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

function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex min-h-[180px] items-center justify-center ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-[#1a80a2]" />
    </div>
  );
}

function RefreshIcon({ isFetching }: { isFetching: boolean }) {
  return isFetching ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#1a80a2]" />
  ) : (
    <RefreshCcw className="mr-2 h-4 w-4" />
  );
}

function formatMetric(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Chưa có";
  }

  return value.toFixed(4);
}

function formatBenchmarkPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function translatePromotionReason(reason?: string | null) {
  if (!reason) {
    return "Chưa có";
  }

  const rejectedMatch = reason.match(
    /^Rejected:\s*yolo_map\s*([0-9.]+)\/([0-9.]+),\s*unet_miou\s*([0-9.]+)\/([0-9.]+)\.?$/i,
  );
  if (rejectedMatch) {
    return `Bị từ chối: điểm phát hiện đạt ${rejectedMatch[1]} / yêu cầu ${rejectedMatch[2]}, độ chính xác vùng đạt ${rejectedMatch[3]} / yêu cầu ${rejectedMatch[4]}.`;
  }

  const rejectedUnetMatch = reason.match(
    /^Rejected:\s*unet_miou\s*([0-9.]+)\/([0-9.]+)\.\s*YOLO frozen\.?$/i,
  );
  if (rejectedUnetMatch) {
    return `Bị từ chối: độ chính xác vùng đạt ${rejectedUnetMatch[1]} / yêu cầu ${rejectedUnetMatch[2]}. Bộ phát hiện được giữ cố định.`;
  }

  const promotedMatch = reason.match(
    /^Promoted:\s*yolo_map\s*([0-9.]+)\s*>=\s*([0-9.]+)\s*and\s*unet_miou\s*([0-9.]+)\s*>=\s*([0-9.]+)\.?$/i,
  );
  if (promotedMatch) {
    return `Đã đưa vào sử dụng: điểm phát hiện ${promotedMatch[1]} >= ${promotedMatch[2]} và độ chính xác vùng ${promotedMatch[3]} >= ${promotedMatch[4]}.`;
  }

  const promotedUnetMatch = reason.match(
    /^Promoted:\s*unet_miou\s*([0-9.]+)\s*>=\s*([0-9.]+)\.\s*YOLO frozen\.?$/i,
  );
  if (promotedUnetMatch) {
    return `Đã đưa vào sử dụng: độ chính xác vùng ${promotedUnetMatch[1]} >= ${promotedUnetMatch[2]}. Bộ phát hiện được giữ cố định.`;
  }

  if (reason.includes("No complete baseline metrics found")) {
    return "Không tìm thấy đủ chỉ số của mô hình hiện tại nên không tự động đưa mô hình mới vào sử dụng.";
  }

  if (reason.includes("Candidate metrics missing")) {
    return "Mô hình ứng viên thiếu chỉ số cần thiết nên không thể đánh giá.";
  }

  return reason;
}

function translateRunMode(mode: string) {
  if (mode === "remote-trainer") {
    return "Huấn luyện từ xa";
  }

  if (mode === "inline-trainer") {
    return "Huấn luyện nội bộ";
  }

  return mode;
}

function stripLogPrefix(line: string) {
  return line.replace(/^\[(stdout|stderr)\]\s*/i, "");
}

function extractJsonConfig(logs: string | null | undefined, key: "yolo" | "unet") {
  if (!logs) {
    return null;
  }

  const pattern = new RegExp(`\\[CONFIG\\]\\s+${key}=(\\{.*\\})`);
  const match = logs
    .split("\n")
    .map(stripLogPrefix)
    .find((line) => pattern.test(line))
    ?.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(match[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractDatasetSplit(logs: string | null | undefined) {
  if (!logs) {
    return null;
  }

  const line = logs
    .split("\n")
    .map(stripLogPrefix)
    .find((item) => item.includes("[DATASET] split_counts"));

  const match = line?.match(/train=(\d+)\s+valid=(\d+)\s+test=(\d+)/);
  if (!match) {
    return null;
  }

  return {
    train: Number(match[1]),
    valid: Number(match[2]),
    test: Number(match[3]),
  };
}

function extractLastNumericMetric(logs: string | null | undefined, key: "map" | "miou") {
  if (!logs) {
    return null;
  }

  const pattern = key === "map" ? /"map"\s*:\s*([0-9.]+)/g : /"miou"\s*:\s*([0-9.]+)/g;
  let value: number | null = null;
  for (const match of logs.matchAll(pattern)) {
    value = Number(match[1]);
  }

  return value;
}

function TrainingConfigPanel({ logs }: { logs?: string | null }) {
  const yolo = extractJsonConfig(logs, "yolo");
  const unet = extractJsonConfig(logs, "unet");
  const split = extractDatasetSplit(logs);

  if (!yolo && !unet && !split) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-500">
        Cấu hình huấn luyện sẽ hiện ở đây khi bộ huấn luyện bắt đầu gửi nhật ký.
      </div>
    );
  }

  const renderConfig = (title: string, config: Record<string, unknown> | null) => (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </div>
      {config ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {Object.entries(config)
            .filter(([key]) => !["model", "init_checkpoint"].includes(key))
            .map(([key, value]) => (
              <React.Fragment key={key}>
                <span className="text-gray-500">
                  {trainingConfigLabels[key] || key}
                </span>
                <span className="font-medium text-gray-900">{String(value)}</span>
              </React.Fragment>
            ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">Chưa có nhật ký cấu hình.</div>
      )}
    </div>
  );

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {renderConfig("Bộ phát hiện cố định", yolo)}
      {renderConfig("Mô hình phân vùng", unet)}
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Phân chia dữ liệu
        </div>
        {split ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-500">Tập huấn luyện</span>
            <span className="font-medium">{split.train}</span>
            <span className="text-gray-500">Tập kiểm định</span>
            <span className="font-medium">{split.valid}</span>
            <span className="text-gray-500">Tập kiểm thử</span>
            <span className="font-medium">{split.test}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Chưa xuất xong dữ liệu huấn luyện.</div>
        )}
      </div>
    </div>
  );
}

function getAnnotationQueryStatus(status: DataQueueStatusFilter) {
  if (status === "submitted") return "Submitted";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "all";
}

function matchesDataQueueStatus(
  item: UnifiedDataQueueItem,
  status: DataQueueStatusFilter,
) {
  if (status === "all") return true;
  if (item.type === "review") return status === "action-needed";

  const candidateStatus = item.annotation.candidateStatus;
  if (status === "action-needed") {
    return ["QUEUED", "INPROGRESS"].includes(candidateStatus);
  }
  if (status === "submitted") return candidateStatus === "SUBMITTED";
  if (status === "approved") return candidateStatus === "APPROVED";
  if (status === "rejected") return candidateStatus === "REJECTED";

  return true;
}

function isActionNeededDataQueueItem(item: UnifiedDataQueueItem) {
  if (item.type === "review") return true;

  return ["QUEUED", "INPROGRESS"].includes(item.annotation.candidateStatus);
}

function dataQueueTypeLabel(item: UnifiedDataQueueItem) {
  return item.type === "review" ? "Duyệt kết quả" : "Gán nhãn";
}

function dataQueueStatusLabel(item: UnifiedDataQueueItem) {
  return item.type === "review"
    ? "Cần xử lý"
    : statusLabels[item.annotation.candidateStatus] ||
        item.annotation.candidateStatus;
}

function dataQueueStatusClass(item: UnifiedDataQueueItem) {
  return item.type === "review"
    ? statusBadgeClass("PENDING")
    : statusBadgeClass(item.annotation.candidateStatus);
}

function dataQueueDisplayName(item: UnifiedDataQueueItem) {
  if (item.type === "review") {
    return item.review.workerName || `Yêu cầu ${item.review.requestId.slice(0, 8)}`;
  }

  return `Mẫu ${item.annotation.requestId.slice(0, 8)}`;
}

function DataQueueList({
  items,
  selectedKey,
  onSelect,
}: {
  items: UnifiedDataQueueItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pageTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const totalPages = Math.max(1, Math.ceil(items.length / DATA_QUEUE_PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const pageStart = (normalizedPage - 1) * DATA_QUEUE_PAGE_SIZE;
  const visibleItems = items.slice(pageStart, pageStart + DATA_QUEUE_PAGE_SIZE);
  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(totalPages, Math.max(1, nextPage));
    const nextItem = items[(safePage - 1) * DATA_QUEUE_PAGE_SIZE];

    if (safePage === normalizedPage) return;

    if (pageTransitionTimeoutRef.current) {
      clearTimeout(pageTransitionTimeoutRef.current);
    }

    setIsPageTransitioning(true);
    setPage(safePage);
    if (nextItem) {
      onSelect(nextItem.key);
    }

    pageTransitionTimeoutRef.current = setTimeout(() => {
      setIsPageTransitioning(false);
      pageTransitionTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    if (!selectedKey) {
      setPage(1);
      return;
    }

    const selectedIndex = items.findIndex((item) => item.key === selectedKey);
    if (selectedIndex === -1) {
      setPage(1);
      return;
    }

    setPage(Math.floor(selectedIndex / DATA_QUEUE_PAGE_SIZE) + 1);
  }, [items, selectedKey]);

  useEffect(
    () => () => {
      if (pageTransitionTimeoutRef.current) {
        clearTimeout(pageTransitionTimeoutRef.current);
      }
    },
    [],
  );

  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
        Không có dữ liệu cần xử lý phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          className={[
            "space-y-2 transition-opacity duration-200 ease-out",
            isPageTransitioning ? "opacity-45" : "opacity-100",
          ].join(" ")}
        >
          {visibleItems.map((item) => {
            const isActive = item.key === selectedKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={[
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors",
                  isActive
                    ? "border-[#1a80a2] bg-[#eaf6fa] shadow-sm"
                    : "border-gray-200 hover:border-[#a8d8e7] hover:bg-gray-50",
                ].join(" ")}
              >
                <div className="h-[68px] w-[68px] flex-none overflow-hidden rounded-md border bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={dataQueueTypeLabel(item)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-h-[68px] min-w-0 flex-1 flex-col justify-center">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={
                        item.type === "review"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-purple-200 bg-purple-50 text-purple-700"
                      }
                    >
                      {dataQueueTypeLabel(item)}
                    </Badge>
                    <Badge variant="outline" className={dataQueueStatusClass(item)}>
                      {dataQueueStatusLabel(item)}
                    </Badge>
                  </div>
                  <div className="mt-1.5 truncate text-sm font-semibold text-gray-950">
                    {dataQueueDisplayName(item)}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-gray-500">
                    {item.environmentKey} · {formatDate(item.createdAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {isPageTransitioning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/45">
            <Loader2 className="h-5 w-5 animate-spin text-[#1a80a2]" />
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer px-2"
            disabled={normalizedPage === 1}
            onClick={() => handlePageChange(normalizedPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-medium text-gray-600">
            {pageStart + 1}-
            {Math.min(pageStart + DATA_QUEUE_PAGE_SIZE, items.length)} / {items.length}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer px-2"
            disabled={normalizedPage === totalPages}
            onClick={() => handlePageChange(normalizedPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewDetailPanel({
  item,
  onSaved,
}: {
  item: Extract<UnifiedDataQueueItem, { type: "review" }>;
  onSaved: (handledKey: string) => Promise<void>;
}) {
  const [verdict, setVerdict] = useState<"PASS" | "FAIL">("PASS");
  const [reason, setReason] = useState("");
  const reviewMutation = useReviewScoringResult();

  useEffect(() => {
    setVerdict("PASS");
    setReason("");
  }, [item.review.resultId]);

  const handleSubmit = async () => {
    try {
      await reviewMutation.mutateAsync({
        resultId: item.review.resultId,
        data: { verdict, reason: reason.trim() || undefined },
      });
      toastUtils.success("Đã lưu kết quả duyệt");
      setReason("");
      setVerdict("PASS");
      await onSaved(item.key);
    } catch (error) {
      console.error("Không thể lưu kết quả duyệt:", error);
      toastUtils.error("Không thể lưu kết quả duyệt");
    }
  };

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            Duyệt kết quả
          </Badge>
          <Badge variant="outline" className={statusBadgeClass("PENDING")}>
            Cần xử lý
          </Badge>
        </div>
        <h2 className="mt-2 truncate text-lg font-semibold text-gray-950">
          {dataQueueDisplayName(item)}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {item.review.environmentKey} · {formatDate(item.review.createdAt)}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.review.source}
          alt="Ảnh cần duyệt"
          className="max-h-[320px] w-full object-contain"
        />
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Người lao động
          </p>
          <p className="mt-1 font-medium text-gray-950">
            {item.review.workerName || "Chưa có"}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Môi trường
          </p>
          <p className="mt-1 font-medium text-gray-950">
            {item.review.environmentKey}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Mã yêu cầu
          </p>
          <p className="mt-1 break-all font-mono text-xs font-medium text-gray-950">
            {item.review.requestId}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-gray-950">
          Kết quả duyệt
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["PASS", "FAIL"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={verdict === value ? "default" : "outline"}
              className={
                verdict === value
                  ? "cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                  : "cursor-pointer"
              }
              onClick={() => setVerdict(value)}
            >
              {value === "PASS" ? "Đạt" : "Không đạt"}
            </Button>
          ))}
        </div>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ghi chú duyệt"
          className="mt-3 min-h-[96px]"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={reviewMutation.isPending}
            className="cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90"
          >
            {reviewMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu kết quả
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnnotationDetailPanel({
  item,
  canEditAnnotations,
}: {
  item: Extract<UnifiedDataQueueItem, { type: "annotation" }>;
  canEditAnnotations: boolean;
}) {
  const shouldEdit =
    canEditAnnotations &&
    !item.annotation.hasAnnotation &&
    item.annotation.candidateStatus !== "APPROVED";
  const actionHref = shouldEdit
    ? `/supervisor/ai-retrain/annotations/${item.annotation.candidateId}?mode=edit`
    : `/supervisor/ai-retrain/annotations/${item.annotation.candidateId}`;
  const ActionIcon = shouldEdit ? Edit2 : Eye;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-purple-200 bg-purple-50 text-purple-700">
              Gán nhãn
            </Badge>
            <Badge
              variant="outline"
              className={statusBadgeClass(item.annotation.candidateStatus)}
            >
              {statusLabels[item.annotation.candidateStatus] ||
                item.annotation.candidateStatus}
            </Badge>
          </div>
          <h2 className="mt-2 truncate text-lg font-semibold text-gray-950">
            {dataQueueDisplayName(item)}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {item.annotation.environmentKey} · {formatDate(item.annotation.createdAtUtc)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={actionHref}>
            <Button
              variant={shouldEdit ? "default" : "outline"}
              className={
                shouldEdit
                  ? "w-full cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90 sm:w-auto"
                  : "w-full cursor-pointer sm:w-auto"
              }
            >
              <ActionIcon className="mr-2 h-4 w-4" />
              {shouldEdit ? "Chỉnh sửa" : "Mở"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.annotation.imageUrl}
          alt="Ảnh chờ gán nhãn"
          className="max-h-[320px] w-full object-contain"
        />
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Mã yêu cầu
          </p>
          <p className="mt-1 break-all font-mono text-xs font-medium text-gray-950">
            {item.annotation.requestId}
          </p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase text-gray-500">
            Nhãn
          </p>
          <p className="mt-1 font-medium text-gray-950">
            {item.annotation.hasAnnotation
              ? `v${item.annotation.annotationVersion ?? 1}`
              : "Chưa có"}
          </p>
        </div>
      </div>
    </div>
  );
}

function DataQueueDetailPanel({
  item,
  canEditAnnotations,
  onReviewSaved,
}: {
  item: UnifiedDataQueueItem | undefined;
  canEditAnnotations: boolean;
  onReviewSaved: (handledKey: string) => Promise<void>;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        {!item ? (
          <div className="flex min-h-[440px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
            Chọn một dữ liệu để xem chi tiết.
          </div>
        ) : item.type === "review" ? (
          <ReviewDetailPanel item={item} onSaved={onReviewSaved} />
        ) : (
          <AnnotationDetailPanel
            item={item}
            canEditAnnotations={canEditAnnotations}
          />
        )}
      </CardContent>
    </Card>
  );
}

function UnifiedDataQueue() {
  const { hasRole } = useRole();
  const canEditAnnotations = hasRole([UserRole.Supervisor, UserRole.Admin]);
  const [selectedQueueKey, setSelectedQueueKey] = useState<string | null>(null);
  const [handledReviewKeys, setHandledReviewKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [status, setStatus] = useState<DataQueueStatusFilter>("all");
  const [environmentKey, setEnvironmentKey] = useState("");
  const environmentFilter = environmentKey.trim().toLowerCase();
  const filters = useMemo(
    () => ({
      status: getAnnotationQueryStatus(status),
      environmentKey: environmentKey.trim() || undefined,
      take: 100,
    }),
    [environmentKey, status],
  );
  const {
    data: pendingReviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
    isFetching: reviewsFetching,
  } = usePendingScoringReviews(100);
  const {
    data: candidates = [],
    isLoading: candidatesLoading,
    refetch: refetchCandidates,
    isFetching: candidatesFetching,
  } = useAnnotationCandidates(filters);
  const visiblePendingReviews = useMemo(
    () =>
      pendingReviews.filter(
        (item) => !handledReviewKeys.has(`review-${item.resultId}`),
      ),
    [handledReviewKeys, pendingReviews],
  );

  const queueItems = useMemo(() => {
    const reviewItems: UnifiedDataQueueItem[] = visiblePendingReviews
      .filter((item) =>
        environmentFilter
          ? item.environmentKey.toLowerCase().includes(environmentFilter)
          : true,
      )
      .map((item) => ({
        key: `review-${item.resultId}`,
        type: "review",
        imageUrl: item.source,
        environmentKey: item.environmentKey,
        createdAt: item.createdAt,
        review: item,
      }));

    const annotationItems: UnifiedDataQueueItem[] = candidates.map((candidate) => ({
      key: `annotation-${candidate.candidateId}`,
      type: "annotation",
      imageUrl: candidate.imageUrl,
      environmentKey: candidate.environmentKey,
      createdAt: candidate.createdAtUtc,
      annotation: candidate,
    }));

    return [...reviewItems, ...annotationItems]
      .filter((item) => matchesDataQueueStatus(item, status))
      .sort((a, b) => {
        if (status === "all") {
          const priorityDiff =
            Number(isActionNeededDataQueueItem(b)) -
            Number(isActionNeededDataQueueItem(a));

          if (priorityDiff !== 0) return priorityDiff;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [candidates, environmentFilter, status, visiblePendingReviews]);

  useEffect(() => {
    if (reviewsLoading || candidatesLoading) return;

    if (queueItems.length === 0) {
      if (selectedQueueKey !== null) {
        setSelectedQueueKey(null);
      }
      return;
    }

    if (
      !selectedQueueKey ||
      !queueItems.some((item) => item.key === selectedQueueKey)
    ) {
      setSelectedQueueKey(queueItems[0].key);
    }
  }, [candidatesLoading, queueItems, reviewsLoading, selectedQueueKey]);

  const selectedQueueItem = queueItems.find(
    (item) => item.key === selectedQueueKey,
  );

  const waitingAnnotations = candidates.filter((candidate) =>
    ["QUEUED", "INPROGRESS"].includes(candidate.candidateStatus),
  ).length;
  const submittedAnnotations = candidates.filter(
    (candidate) => candidate.candidateStatus === "SUBMITTED",
  ).length;
  const approvedAnnotations = candidates.filter(
    (candidate) => candidate.candidateStatus === "APPROVED",
  ).length;
  const isLoading = reviewsLoading || candidatesLoading;
  const isFetching = reviewsFetching || candidatesFetching;
  const stats = [
    {
      label: "Cần duyệt",
      value: reviewsLoading ? "..." : visiblePendingReviews.length,
    },
    {
      label: "Cần gán nhãn",
      value: candidatesLoading ? "..." : waitingAnnotations,
    },
    {
      label: "Đã gửi",
      value: candidatesLoading ? "..." : submittedAnnotations,
    },
    {
      label: "Đã duyệt",
      value: candidatesLoading ? "..." : approvedAnnotations,
    },
  ];

  const handleRefresh = () => {
    refetchReviews();
    refetchCandidates();
  };

  const handleReviewSaved = async (handledKey: string) => {
    const currentIndex = queueItems.findIndex((item) => item.key === handledKey);
    const remainingItems = queueItems.filter((item) => item.key !== handledKey);
    const nextItem =
      queueItems.find(
        (item, index) => item.key !== handledKey && index > currentIndex,
      ) ??
      remainingItems[0];

    setHandledReviewKeys((previous) => {
      const next = new Set(previous);
      next.add(handledKey);
      return next;
    });
    setSelectedQueueKey(nextItem?.key ?? null);
    await Promise.all([refetchReviews(), refetchCandidates()]);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Dữ liệu cần xử lý</CardTitle>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                className="cursor-pointer"
              >
                <RefreshIcon isFetching={isFetching} />
                Tải lại
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
                >
                  <div className="text-[10px] font-semibold uppercase leading-4 text-gray-500">
                    {stat.label}
                  </div>
                  <div className="text-base font-semibold leading-5 text-gray-950">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-1.5">
                {dataQueueStatusFilters.map((filter) => {
                  const isActive = status === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatus(filter.value)}
                      className={[
                        "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                        isActive
                          ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
              <Input
                value={environmentKey}
                onChange={(event) => setEnvironmentKey(event.target.value)}
                placeholder="Mã môi trường"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <DataQueueList
                items={queueItems}
                selectedKey={selectedQueueKey}
                onSelect={setSelectedQueueKey}
              />
            )}
          </CardContent>
        </Card>

        <DataQueueDetailPanel
          item={selectedQueueItem}
          canEditAnnotations={canEditAnnotations}
          onReviewSaved={handleReviewSaved}
        />
    </div>
  );
}

function DataWorkflow() {
  return <UnifiedDataQueue />;
}

function BenchmarkSampleCard({
  sample,
  imageMode,
}: {
  sample: (typeof segmentationBenchmarkDataset.samples)[number];
  imageMode: "overlay" | "original";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageMode === "overlay" ? sample.overlayPath : sample.imagePath;

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex aspect-[4/3] items-center justify-center bg-gray-50">
        {imageFailed ? (
          <div className="px-4 text-center text-sm text-gray-500">
            Không tải được ảnh benchmark
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt={sample.title}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="space-y-2 p-3">
        <div className="truncate text-sm font-semibold text-gray-950">
          {sample.title}
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div className="rounded-md bg-gray-50 px-2 py-1">
            <div className="font-semibold text-gray-950">
              {formatBenchmarkPercent(sample.pixelAccuracy)}
            </div>
            <div className="text-gray-500">Pixel</div>
          </div>
          <div className="rounded-md bg-gray-50 px-2 py-1">
            <div className="font-semibold text-gray-950">
              {formatBenchmarkPercent(sample.meanIou)}
            </div>
            <div className="text-gray-500">Vùng</div>
          </div>
          <div className="rounded-md bg-gray-50 px-2 py-1">
            <div className="font-semibold text-gray-950">
              {formatBenchmarkPercent(sample.meanDiceF1)}
            </div>
            <div className="text-gray-500">Dice/F1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkDatasetOverview() {
  const [imageMode, setImageMode] = useState<"overlay" | "original">("overlay");
  const [page, setPage] = useState(1);
  const samples = segmentationBenchmarkDataset.samples;
  const totalPages = Math.max(
    1,
    Math.ceil(samples.length / BENCHMARK_GALLERY_PAGE_SIZE),
  );
  const normalizedPage = Math.min(page, totalPages);
  const pageStart = (normalizedPage - 1) * BENCHMARK_GALLERY_PAGE_SIZE;
  const visibleSamples = samples.slice(
    pageStart,
    pageStart + BENCHMARK_GALLERY_PAGE_SIZE,
  );
  const stats = [
    {
      label: "Ảnh benchmark",
      value: segmentationBenchmarkDataset.imageCount,
    },
    {
      label: "Mask chuẩn",
      value: segmentationBenchmarkDataset.maskCount,
    },
    {
      label: "Độ chính xác pixel",
      value: formatBenchmarkPercent(segmentationBenchmarkDataset.pixelAccuracy),
    },
    {
      label: "Độ trùng khớp vùng",
      value: formatBenchmarkPercent(segmentationBenchmarkDataset.meanIou),
    },
    {
      label: "Dice/F1",
      value: formatBenchmarkPercent(segmentationBenchmarkDataset.meanDiceF1),
    },
  ];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Bộ ảnh benchmark mô hình phân vùng</CardTitle>
            <p className="mt-2 max-w-3xl text-sm text-gray-500">
              Đây là tập ảnh cố định, không dùng để huấn luyện. Bộ này dùng để
              so sánh mô hình hiện tại và mô hình ứng viên trên cùng bằng chứng.
            </p>
          </div>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            {[
              ["overlay", "Overlay"],
              ["original", "Ảnh gốc"],
            ].map(([value, label]) => {
              const isActive = imageMode === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setImageMode(value as "overlay" | "original")}
                  className={[
                    "cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-white text-[#0f6680] shadow-sm"
                      : "text-gray-600 hover:text-gray-950",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <div className="text-xs font-semibold uppercase text-gray-500">
                {stat.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-gray-950">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleSamples.map((sample) => (
            <BenchmarkSampleCard
              key={sample.id}
              sample={sample}
              imageMode={imageMode}
            />
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer px-2"
            disabled={normalizedPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-medium text-gray-600">
            {pageStart + 1}-
            {Math.min(pageStart + BENCHMARK_GALLERY_PAGE_SIZE, samples.length)} /{" "}
            {samples.length}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 cursor-pointer px-2"
            disabled={normalizedPage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BenchmarkOverview() {
  const coreMetrics = [
    ["Độ chính xác kết luận", "Tỷ lệ kết luận khớp dữ liệu chuẩn"],
    ["Tỷ lệ đạt sai", "Rủi ro mô hình cho đạt khi thực tế không đạt"],
    ["Tỷ lệ không đạt sai", "Rủi ro mô hình cho không đạt khi thực tế đạt"],
    ["Tỷ lệ chờ duyệt", "Tỷ lệ ảnh cần giám sát viên can thiệp"],
    ["Độ trễ trung bình", "Độ trễ suy luận trung bình"],
    ["Độ trùng khớp vùng", "Chỉ dùng cho ảnh đánh giá có vùng nhãn đủ tốt"],
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá chất lượng chấm điểm AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Bộ đánh giá là điều kiện trước khi đưa mô hình mới vào sử dụng.
            Không dùng chỉ số kiểm tra nhanh, nhật ký chạy thử hoặc nhãn vẽ chưa
            đủ chuẩn để khẳng định chất lượng phân vùng.
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">
                Bộ ảnh thử nghiệm
              </div>
              <div className="mt-1 text-lg font-semibold">46 ảnh thật</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">
                Mask chuẩn
              </div>
              <div className="mt-1 text-lg font-semibold">46 mask</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">
                Dữ liệu chuẩn
              </div>
              <div className="mt-1 text-lg font-semibold">Mask đã đối chiếu</div>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="text-xs font-semibold uppercase text-gray-500">
                Điều kiện đưa vào sử dụng
              </div>
              <div className="mt-1 text-lg font-semibold">Có benchmark cố định</div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chỉ số</TableHead>
                <TableHead>Ý nghĩa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coreMetrics.map(([metric, meaning]) => (
                <TableRow key={metric}>
                  <TableCell className="font-medium">{metric}</TableCell>
                  <TableCell>{meaning}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelVersions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiên bản mô hình và quy tắc đưa vào sử dụng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase text-gray-500">
              Bộ phát hiện cố định
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              Cố định trong phạm vi huấn luyện lại
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Chỉ dùng để kiểm tra nhanh quá trình suy luận khi cần.
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase text-gray-500">
              Mô hình hiện tại
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              Mô hình đang phục vụ hệ thống
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Mốc hiện tại để so sánh với mô hình ứng viên trên cùng bộ đánh giá.
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase text-gray-500">
              Mô hình ứng viên
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              Chỉ đưa vào sử dụng sau khi đạt bộ đánh giá
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Không tự động đưa vào sử dụng nếu thiếu mốc hiện tại hoặc báo cáo.
            </p>
          </div>
        </div>
        <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          Mô hình ứng viên đạt yêu cầu khi không làm tăng tỷ lệ đạt sai, không
          làm giảm độ chính xác kết luận, độ chính xác vùng không thấp hơn mốc
          hiện tại và độ trễ vẫn đạt yêu cầu.
        </div>
      </CardContent>
    </Card>
  );
}

function RetrainRuns({
  dialogOpen,
  onDialogOpenChange,
}: {
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}) {
  const { hasRole } = useRole();
  const canTrigger = hasRole([
    UserRole.Supervisor,
    UserRole.Manager,
    UserRole.Admin,
  ]);
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const isDialogOpen = dialogOpen ?? internalDialogOpen;
  const setDialogOpen = onDialogOpenChange ?? setInternalDialogOpen;
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<TriggerScoringRetrainRequest>({
    lookbackDays: 7,
    minReviewedSamples: 25,
    minApprovedAnnotations: 100,
    maxSamplesPerBatch: 500,
    includeRejectedTrainingSamples: false,
  });
  const { data = [], isLoading, refetch, isFetching } = useRetrainBatches({
    take: 50,
  });
  const triggerMutation = useTriggerRetrainBatch();

  const toggleExpanded = (batchId: string) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchId]: !prev[batchId]
    }));
  };

  const handleTrigger = async () => {
    try {
      await triggerMutation.mutateAsync(form);
      toastUtils.success("Đã kích hoạt phiên huấn luyện mô hình");
      setDialogOpen(false);
    } catch (error) {
      console.error("Không thể kích hoạt huấn luyện mô hình:", error);
      toastUtils.error("Không thể kích hoạt huấn luyện mô hình");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch sử huấn luyện mô hình</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer"
          >
            <RefreshIcon isFetching={isFetching} />
            Tải lại
          </Button>
          {canTrigger && (
            <Button
              className="cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90"
              onClick={() => setDialogOpen(true)}
            >
              <Play className="mr-2 h-4 w-4" />
              Kích hoạt huấn luyện mô hình
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Chưa có phiên huấn luyện mô hình nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Phiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mẫu dữ liệu</TableHead>
                <TableHead>Kết quả điều kiện đưa vào sử dụng</TableHead>
                <TableHead>Thời điểm tạo</TableHead>
                <TableHead>Lượt chạy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((batch) => (
                <React.Fragment key={batch.batchId}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleExpanded(batch.batchId)}>
                    <TableCell>
                      {expandedBatches[batch.batchId] ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {batch.batchId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeClass(batch.status)}
                      >
                        {statusLabels[batch.status] || batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>Đã duyệt {batch.reviewedSampleCount}</div>
                      <div>
                        Nhãn đã duyệt {batch.approvedAnnotationCount} / Đủ điều kiện{" "}
                        {batch.eligibleApprovedAnnotationCount}
                      </div>
                      <div className="text-xs text-gray-500">
                        Đã chọn {batch.selectedAnnotationCount} / Đã dùng{" "}
                        {batch.alreadyTrainedAnnotationCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {batch.promoted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="line-clamp-2 text-sm">
                          {translatePromotionReason(batch.promotionReason)}
                        </span>
                      </div>
                      {(batch.candidateMetric !== null && batch.candidateMetric !== undefined) && (
                        <div className="mt-1 text-xs text-gray-500">
                          Ứng viên {formatMetric(batch.candidateMetric)}
                          {batch.baselineMetric !== null && batch.baselineMetric !== undefined
                            ? ` / Mốc hiện tại ${formatMetric(batch.baselineMetric)}`
                            : " / Mốc hiện tại chưa có"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(batch.requestedAtUtc)}</TableCell>
                    <TableCell>{batch.runCount}</TableCell>
                  </TableRow>
                  {expandedBatches[batch.batchId] && batch.runs?.map((run) => {
                    const candidateUnetMiou = extractLastNumericMetric(run.logs, "miou");

                    return (
                      <TableRow key={run.runId} className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-xs font-bold text-gray-700">
                                Lượt chạy: {run.runId.split("-")[0]}
                              </span>
                              <Badge className={statusBadgeClass(run.status)}>
                                {statusLabels[run.status] || run.status}
                              </Badge>
                              <span className="rounded border bg-white px-2 py-1 text-xs font-semibold uppercase text-gray-600 shadow-sm">
                                {translateRunMode(run.mode)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Bắt đầu: {formatDate(run.startedAtUtc)}
                              </span>
                              {run.exitCode !== null && run.exitCode !== undefined && (
                                <span className="text-sm font-bold text-gray-700">
                                  Mã thoát: {run.exitCode}
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-auto cursor-pointer"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  refetch();
                                }}
                                disabled={isFetching}
                              >
                                <RefreshIcon isFetching={isFetching} />
                                Tải nhật ký mới
                              </Button>
                            </div>

                            {run.message && (
                              <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                <strong>Thông báo:</strong> {run.message}
                              </div>
                            )}

                            <TrainingConfigPanel logs={run.logs} />

                            <div className="grid gap-3 lg:grid-cols-4">
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Điểm tổng hợp ứng viên
                                </div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatMetric(batch.candidateMetric)}
                                </div>
                              </div>
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Điểm tổng hợp hiện tại
                                </div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatMetric(batch.baselineMetric)}
                                </div>
                              </div>
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Mức cải thiện yêu cầu
                                </div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatMetric(batch.minimumImprovement)}
                                </div>
                              </div>
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Độ chính xác vùng
                                </div>
                                <div className="mt-1 text-sm text-gray-700">
                                  Mô hình ứng viên: <strong>{formatMetric(candidateUnetMiou)}</strong>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Bộ phát hiện được giữ cố định; chỉ dùng kiểm tra nhanh khi cần.
                                </div>
                              </div>
                            </div>

                            <div className="rounded-md border border-gray-800 bg-black">
                              <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                                  Nhật ký huấn luyện
                                </span>
                                {run.logs && (
                                  <span className="text-xs text-gray-500">
                                    {run.logs.split("\n").length} dòng
                                  </span>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap p-4 font-mono text-[13px] leading-5 text-green-400">
                                {run.logs || "Bộ huấn luyện chưa gửi nhật ký."}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <StandardDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Kích hoạt huấn luyện mô hình"
      >
        <div className="space-y-4">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Số ngày nhìn lại</label>
            <Input
              type="number"
              min={1}
              value={form.lookbackDays}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lookbackDays: Number(event.target.value),
                }))
              }
            />
            <label className="text-sm font-medium">
              Số nhãn vùng bẩn đã duyệt tối thiểu
            </label>
            <Input
              type="number"
              min={1}
              value={form.minApprovedAnnotations}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minApprovedAnnotations: Number(event.target.value),
                }))
              }
            />
            <label className="text-sm font-medium">Số mẫu tối đa mỗi phiên</label>
            <Input
              type="number"
              min={1}
              max={5000}
              value={form.maxSamplesPerBatch}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  maxSamplesPerBatch: Number(event.target.value),
                }))
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.includeRejectedTrainingSamples)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    includeRejectedTrainingSamples: event.target.checked,
                  }))
                }
              />
              Cho phép dùng lại mẫu từng bị từ chối khi tạo dữ liệu huấn luyện
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              className="cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90"
              onClick={handleTrigger}
              disabled={triggerMutation.isPending}
            >
              {triggerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kích hoạt huấn luyện mô hình
            </Button>
          </div>
        </div>
      </StandardDialog>
    </Card>
  );
}

export function AiRetrainContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasRole } = useRole();
  const canTriggerTraining = hasRole([
    UserRole.Supervisor,
    UserRole.Manager,
    UserRole.Admin,
  ]);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const activeTab = parseRetrainTab(searchParams.get("tab"));

  const handleTabChange = (value: string) => {
    const nextTab = parseRetrainTab(value);
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "data") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-xl font-semibold text-black">
            Huấn luyện mô hình AI
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Duyệt dữ liệu chuẩn, huấn luyện và đánh giá mô hình trước khi đưa vào sử dụng.
          </p>
        </div>
        {canTriggerTraining && (
          <Button
            className="w-full cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90 sm:w-auto"
            onClick={() => {
              handleTabChange("training");
              setTrainingDialogOpen(true);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Kích hoạt huấn luyện mô hình
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-3"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
          <TabsList
            className="grid h-auto w-full grid-cols-1 gap-1.5 bg-transparent p-0 md:grid-cols-3"
          >
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeTab === step.value;

              return (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  className="h-auto min-w-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-current after:hidden data-active:bg-transparent data-active:shadow-none focus-visible:ring-0"
                >
                  <span className={workflowTabClass(isActive)}>
                    <span
                      className={[
                        "flex h-8 w-8 flex-none items-center justify-center rounded-md",
                        isActive
                          ? "bg-[#1a80a2] text-white"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {step.title}
                      </span>
                      <span className="hidden whitespace-normal text-xs leading-4 text-gray-500 xl:block">
                        {step.description}
                      </span>
                    </span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <TabsContent value="data">
          <DataWorkflow />
        </TabsContent>
        <TabsContent value="training">
          <RetrainRuns
            dialogOpen={trainingDialogOpen}
            onDialogOpenChange={setTrainingDialogOpen}
          />
        </TabsContent>
        <TabsContent value="quality" className="space-y-5">
          <BenchmarkDatasetOverview />
          <BenchmarkOverview />
          <ModelVersions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
