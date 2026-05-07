"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TriggerScoringRetrainRequest,
} from "@/types/scoring";
import {
  CheckCircle2,
  ChevronDown,
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
};

const trainingConfigLabels: Record<string, string> = {
  epochs: "Số vòng train",
  batch: "Kích thước batch",
  imgsz: "Kích thước ảnh",
  workers: "Số worker",
  device: "Thiết bị",
  half: "Dùng FP16",
  encoder: "Encoder",
  encoder_weights: "Trọng số encoder",
  lr: "Learning rate",
};

type RetrainTab = "reviews" | "annotations" | "runs";

function parseRetrainTab(value?: string | null): RetrainTab {
  if (value === "annotations" || value === "runs") {
    return value;
  }

  return "reviews";
}

const browserTabTriggerClass =
  "h-12 flex-none cursor-pointer rounded-none border-0 bg-transparent p-0 text-current after:hidden hover:bg-transparent data-active:!bg-transparent data-active:shadow-none focus-visible:ring-0";

function browserTabInnerClass(isActive: boolean) {
  return [
    "flex h-11 items-center gap-2 rounded-t-lg border border-b-0 px-5 text-sm font-medium transition-colors",
    isActive
      ? "border-[#1a80a2] bg-[#1a80a2] text-white shadow-sm"
      : "border-gray-200 bg-white text-gray-700 hover:border-[#a8d8e7] hover:bg-[#eaf6fa] hover:text-[#0f6680]",
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

function formatQualityScore(value: number) {
  return `${value.toFixed(2)}%`;
}

function translatePromotionReason(reason?: string | null) {
  if (!reason) {
    return "Chưa có";
  }

  const rejectedMatch = reason.match(
    /^Rejected:\s*yolo_map\s*([0-9.]+)\/([0-9.]+),\s*unet_miou\s*([0-9.]+)\/([0-9.]+)\.?$/i,
  );
  if (rejectedMatch) {
    return `Bị từ chối: YOLO mAP đạt ${rejectedMatch[1]} / yêu cầu ${rejectedMatch[2]}, U-Net mIoU đạt ${rejectedMatch[3]} / yêu cầu ${rejectedMatch[4]}.`;
  }

  const promotedMatch = reason.match(
    /^Promoted:\s*yolo_map\s*([0-9.]+)\s*>=\s*([0-9.]+)\s*and\s*unet_miou\s*([0-9.]+)\s*>=\s*([0-9.]+)\.?$/i,
  );
  if (promotedMatch) {
    return `Đã đưa vào sử dụng: YOLO mAP ${promotedMatch[1]} >= ${promotedMatch[2]} và U-Net mIoU ${promotedMatch[3]} >= ${promotedMatch[4]}.`;
  }

  if (reason.includes("No complete baseline metrics found")) {
    return "Không tìm thấy đủ metric của model hiện tại nên không tự động đưa model mới vào sử dụng.";
  }

  if (reason.includes("Candidate metrics missing")) {
    return "Model ứng viên thiếu metric cần thiết nên không thể đánh giá.";
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
      {renderConfig("YOLOv8", yolo)}
      {renderConfig("U-Net", unet)}
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Phân chia dữ liệu
        </div>
        {split ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-500">Tập train</span>
            <span className="font-medium">{split.train}</span>
            <span className="text-gray-500">Tập kiểm định</span>
            <span className="font-medium">{split.valid}</span>
            <span className="text-gray-500">Tập test</span>
            <span className="font-medium">{split.test}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Chưa xuất xong dữ liệu huấn luyện.</div>
        )}
      </div>
    </div>
  );
}

function ReviewDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PendingScoringReviewItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [verdict, setVerdict] = useState<"PASS" | "FAIL">("PASS");
  const [reason, setReason] = useState("");
  const reviewMutation = useReviewScoringResult();

  const handleSubmit = async () => {
    if (!item) return;
    try {
      await reviewMutation.mutateAsync({
        resultId: item.resultId,
        data: { verdict, reason: reason.trim() || undefined },
      });
      toastUtils.success("Đã lưu kết quả duyệt");
      onOpenChange(false);
      setReason("");
      setVerdict("PASS");
    } catch (error) {
      console.error("Không thể lưu kết quả duyệt:", error);
      toastUtils.error("Không thể lưu kết quả duyệt");
    }
  };

  return (
    <StandardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Duyệt kết quả AI"
      maxWidth="xl"
    >
      {item && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="overflow-hidden rounded-lg border bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.source}
                alt="Ảnh cần duyệt"
                className="max-h-[420px] w-full object-contain"
              />
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Người lao động</p>
                <p className="font-medium">{item.workerName || "Chưa có"}</p>
              </div>
              <div>
                <p className="text-gray-500">Môi trường</p>
                <p className="font-medium">{item.environmentKey}</p>
              </div>
              <div>
                <p className="text-gray-500">Điểm chất lượng</p>
                <p className="font-medium">{formatQualityScore(item.qualityScore)}</p>
              </div>
              <div>
                <p className="text-gray-500">Mã yêu cầu</p>
                <p className="break-all font-mono text-xs">{item.requestId}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <Select
              value={verdict}
              onValueChange={(value) => setVerdict(value as "PASS" | "FAIL")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASS">Đạt</SelectItem>
                <SelectItem value="FAIL">Không đạt</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ghi chú duyệt"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={reviewMutation.isPending}
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
            >
              {reviewMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu kết quả
            </Button>
          </div>
        </div>
      )}
    </StandardDialog>
  );
}

function ReviewQueue() {
  const { hasRole } = useRole();
  const canReview = hasRole([UserRole.Supervisor, UserRole.Admin]);
  const [selectedItem, setSelectedItem] =
    useState<PendingScoringReviewItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data = [], isLoading, refetch, isFetching } =
    usePendingScoringReviews(100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hàng chờ duyệt ảnh AI</CardTitle>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshIcon isFetching={isFetching} />
          Tải lại
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không có ảnh kết quả AI cần duyệt thuộc worker bạn quản lý.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Người lao động</TableHead>
                <TableHead>Môi trường</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.resultId}>
                  <TableCell>
                    <div className="h-16 w-24 overflow-hidden rounded border bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.source}
                        alt="Ảnh cần duyệt"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{item.workerName || "Chưa có"}</TableCell>
                  <TableCell>{item.environmentKey}</TableCell>
                  <TableCell>{formatQualityScore(item.qualityScore)}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {canReview ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setDialogOpen(true);
                        }}
                      >
                        Duyệt
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-500">Chỉ xem</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ReviewDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}

function AnnotationQueue() {
  const { hasRole } = useRole();
  const canEditAnnotations = hasRole([UserRole.Supervisor, UserRole.Admin]);
  const [status, setStatus] = useState("all");
  const [environmentKey, setEnvironmentKey] = useState("");
  const filters = useMemo(
    () => ({
      status,
      environmentKey: environmentKey.trim() || undefined,
      take: 100,
    }),
    [environmentKey, status],
  );
  const { data = [], isLoading, refetch, isFetching } =
    useAnnotationCandidates(filters);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Hàng chờ gán nhãn</CardTitle>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshIcon isFetching={isFetching} />
            Tải lại
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Queued">Đang chờ</SelectItem>
              <SelectItem value="InProgress">Đang xử lý</SelectItem>
              <SelectItem value="Submitted">Đã gửi</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={environmentKey}
            onChange={(event) => setEnvironmentKey(event.target.value)}
            placeholder="Mã môi trường"
            className="w-[220px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không có dữ liệu gán nhãn nào phù hợp.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Môi trường</TableHead>
                <TableHead>Nhãn</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((candidate) => (
                <TableRow key={candidate.candidateId}>
                  <TableCell>
                    <div className="h-16 w-24 overflow-hidden rounded border bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={candidate.imageUrl}
                        alt="Ảnh chờ gán nhãn"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass(candidate.candidateStatus)}
                    >
                      {statusLabels[candidate.candidateStatus] ||
                        candidate.candidateStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{candidate.environmentKey}</TableCell>
                  <TableCell>
                    {candidate.hasAnnotation
                      ? `v${candidate.annotationVersion ?? 1}`
                      : "Chưa có"}
                  </TableCell>
                  <TableCell>{formatDate(candidate.createdAtUtc)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/supervisor/ai-retrain/annotations/${candidate.candidateId}`}
                      >
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Mở
                        </Button>
                      </Link>
                      {canEditAnnotations &&
                        candidate.candidateStatus !== "APPROVED" && (
                          <Link
                            href={`/supervisor/ai-retrain/annotations/${candidate.candidateId}?mode=edit`}
                          >
                            <Button size="sm">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </Button>
                          </Link>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RetrainRuns() {
  const { hasRole } = useRole();
  const canTrigger = hasRole([
    UserRole.Supervisor,
    UserRole.Manager,
    UserRole.Admin,
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      toastUtils.success("Đã kích hoạt phiên retrain");
      setDialogOpen(false);
    } catch (error) {
      console.error("Không thể kích hoạt retrain:", error);
      toastUtils.error("Không thể kích hoạt retrain");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lịch sử huấn luyện lại</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshIcon isFetching={isFetching} />
            Tải lại
          </Button>
          {canTrigger && (
            <Button
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
              onClick={() => setDialogOpen(true)}
            >
              <Play className="mr-2 h-4 w-4" />
              Kích hoạt huấn luyện lại
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Chưa có phiên retrain nào.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Phiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mẫu dữ liệu</TableHead>
                <TableHead>Kết quả đưa vào sử dụng</TableHead>
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
                    const candidateYoloMap = extractLastNumericMetric(run.logs, "map");
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
                                className="ml-auto"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  refetch();
                                }}
                                disabled={isFetching}
                              >
                                <RefreshIcon isFetching={isFetching} />
                                Tải log mới
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
                                  Metric model ứng viên
                                </div>
                                <div className="mt-1 text-sm text-gray-700">
                                  YOLO mAP: <strong>{formatMetric(candidateYoloMap)}</strong>
                                </div>
                                <div className="text-sm text-gray-700">
                                  U-Net mIoU: <strong>{formatMetric(candidateUnetMiou)}</strong>
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
                              <div className="max-h-[480px] overflow-y-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-5 text-green-400">
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
        )}
      </CardContent>

      <StandardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Kích hoạt retrain"
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
              Số nhãn đã duyệt tối thiểu
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
              Cho phép dùng lại mẫu từng bị từ chối
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
              onClick={handleTrigger}
              disabled={triggerMutation.isPending}
            >
              {triggerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kích hoạt
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
  const activeTab = parseRetrainTab(searchParams.get("tab"));

  const handleTabChange = (value: string) => {
    const nextTab = parseRetrainTab(value);
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "reviews") {
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
    <div className="space-y-6">
      <div>
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold text-black">
            Quy trình huấn luyện lại AI
          </h1>
          <p className="mt-1 text-gray-600">
            Duyệt kết quả AI, gán nhãn dữ liệu và kích hoạt huấn luyện lại model
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-0"
      >
        <div className="border-b border-gray-200">
          <TabsList
            variant="line"
            className="h-11 w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0"
          >
            <TabsTrigger
              value="reviews"
              className={browserTabTriggerClass}
            >
              <span className={browserTabInnerClass(activeTab === "reviews")}>
                <CheckCircle2 className="h-4 w-4" />
                Hàng chờ duyệt
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="annotations"
              className={browserTabTriggerClass}
            >
              <span
                className={browserTabInnerClass(activeTab === "annotations")}
              >
                <Eye className="h-4 w-4" />
                Hàng chờ gán nhãn
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="runs"
              className={browserTabTriggerClass}
            >
              <span className={browserTabInnerClass(activeTab === "runs")}>
                <GitBranch className="h-4 w-4" />
                Lịch sử huấn luyện lại
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="reviews" className="mt-5">
          <ReviewQueue />
        </TabsContent>
        <TabsContent value="annotations" className="mt-5">
          <AnnotationQueue />
        </TabsContent>
        <TabsContent value="runs" className="mt-5">
          <RetrainRuns />
        </TabsContent>
      </Tabs>
    </div>
  );
}
