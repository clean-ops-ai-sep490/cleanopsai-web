import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toastUtils } from "@/lib/utils/toast-utils";
import { UserRole, useRole } from "@/hooks/useRole";
import { useRetrainBatches, useTriggerRetrainBatch } from "@/hooks/useScoringRetrain";
import type {
  ScoringRetrainTrainingSamplesPreview,
  TriggerScoringRetrainRequest,
} from "@/types/scoring";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import {
  formatDate,
  formatMetric,
  LoadingSpinner,
  RefreshIcon,
  statusBadgeClass,
  statusLabels,
} from "./ai-retrain-shared";
import {
  ModelVersionHistory,
  TrainingModelOverview,
} from "./AiRetrainModelHistory";
import { TrainingSamplesPreviewCard } from "./AiRetrainTrainingPreview";
import {
  getBatchPublishedAt,
  getBatchTimestamp,
  getMetricLabel,
  getPromotionGateResultLabel,
  getPromotionGateThreshold,
  isBenchmarkGateBatch,
  TrainingConfigPanel,
  translatePromotionReason,
  translateRunMode,
} from "./AiRetrainTrainingUtils";
type RetrainRunStatusFilter =
  | "all"
  | "QUEUED"
  | "RUNNING"
  | "FAILED"
  | "PROMOTED"
  | "REJECTED";
type RetrainRunPromotionFilter = "all" | "promoted" | "not-promoted";
type RetrainRunSampleFilter = "all" | "selected" | "eligible" | "no-selected";

const RETRAIN_RUN_PAGE_SIZE_OPTIONS = [5, 10, 20];
export function RetrainRuns({
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
  const [trainingSection, setTrainingSection] = useState<"training" | "models">(
    "training",
  );
  const [runSearch, setRunSearch] = useState("");
  const [runStatusFilter, setRunStatusFilter] =
    useState<RetrainRunStatusFilter>("all");
  const [runPromotionFilter, setRunPromotionFilter] =
    useState<RetrainRunPromotionFilter>("all");
  const [runSampleFilter, setRunSampleFilter] =
    useState<RetrainRunSampleFilter>("all");
  const [runRequestedFrom, setRunRequestedFrom] = useState("");
  const [runRequestedTo, setRunRequestedTo] = useState("");
  const [runPageSize, setRunPageSize] = useState(5);
  const [runPage, setRunPage] = useState(1);
  const [form, setForm] = useState<TriggerScoringRetrainRequest>({
    lookbackDays: 7,
    minReviewedSamples: 25,
    minApprovedAnnotations: 100,
    maxSamplesPerBatch: 500,
    useLastBatchTime: true,
  });
  const { data = [], isLoading, refetch, isFetching } = useRetrainBatches({
    take: 50,
  });
  const triggerMutation = useTriggerRetrainBatch();
  const trainingPreviewFilters = useMemo(
    () => ({
      lookbackDays: form.lookbackDays || 7,
      maxSamples: form.maxSamplesPerBatch || 500,
      useLastBatchTime: Boolean(form.useLastBatchTime),
    }),
    [form.lookbackDays, form.maxSamplesPerBatch, form.useLastBatchTime],
  );
  const [trainingPreviewState, setTrainingPreviewState] = useState<{
    data?: ScoringRetrainTrainingSamplesPreview;
    isLoading: boolean;
    isFetching: boolean;
    hasError: boolean;
  }>({
    isLoading: true,
    isFetching: false,
    hasError: false,
  });
  const handleTrainingFormChange = useCallback(
    (patch: Partial<TriggerScoringRetrainRequest>) => {
      setForm((prev) => ({
        ...prev,
        ...patch,
      }));
    },
    [],
  );
  const handlePreviewStateChange = useCallback(
    (state: {
      data?: ScoringRetrainTrainingSamplesPreview;
      isLoading: boolean;
      isFetching: boolean;
      hasError: boolean;
    }) => {
      setTrainingPreviewState(state);
    },
    [],
  );
  const minApprovedAnnotations = Math.max(1, form.minApprovedAnnotations || 1);
  const approvedAnnotationCount =
    trainingPreviewState.data?.approvedAnnotationCount ?? 0;
  const isTrainingReady =
    Boolean(trainingPreviewState.data) &&
    !trainingPreviewState.isLoading &&
    !trainingPreviewState.hasError &&
    approvedAnnotationCount >= minApprovedAnnotations;
  const trainingSourceLabel = form.useLastBatchTime
    ? "Từ lần huấn luyện gần nhất"
    : `Trong ${Math.max(1, form.lookbackDays || 1)} ngày gần đây`;
  const sortedModelVersions = useMemo(
    () =>
      [...data].sort((a, b) => {
        const aPublishedAt = getBatchTimestamp(getBatchPublishedAt(a));
        const bPublishedAt = getBatchTimestamp(getBatchPublishedAt(b));
        const releaseDiff = Number(b.promoted) - Number(a.promoted);

        if (releaseDiff !== 0) return releaseDiff;
        if (aPublishedAt !== bPublishedAt) return bPublishedAt - aPublishedAt;

        return (
          getBatchTimestamp(b.requestedAtUtc) -
          getBatchTimestamp(a.requestedAtUtc)
        );
      }),
    [data],
  );
  const currentModel = useMemo(
    () =>
      data
        .filter((batch) => batch.promoted && isBenchmarkGateBatch(batch))
        .sort(
          (a, b) =>
            getBatchTimestamp(getBatchPublishedAt(b)) -
            getBatchTimestamp(getBatchPublishedAt(a)),
        )[0],
    [data],
  );
  const latestCandidate = useMemo(
    () =>
      data
        .filter((batch) => !batch.promoted && isBenchmarkGateBatch(batch))
        .sort(
          (a, b) =>
            getBatchTimestamp(b.requestedAtUtc) -
            getBatchTimestamp(a.requestedAtUtc),
        )[0],
    [data],
  );
  const filteredBatches = useMemo(() => {
    const query = runSearch.trim().toLowerCase();
    const requestedFrom = runRequestedFrom
      ? new Date(`${runRequestedFrom}T00:00:00`).getTime()
      : null;
    const requestedTo = runRequestedTo
      ? new Date(`${runRequestedTo}T23:59:59`).getTime()
      : null;

    return [...data]
      .sort(
        (a, b) =>
          getBatchTimestamp(b.requestedAtUtc) -
          getBatchTimestamp(a.requestedAtUtc),
      )
      .filter((batch) => {
        const requestedAt = getBatchTimestamp(batch.requestedAtUtc);
        const matchesSearch =
          !query ||
          batch.batchId.toLowerCase().includes(query) ||
          batch.runs?.some((run) => run.runId.toLowerCase().includes(query));
        const matchesStatus =
          runStatusFilter === "all" || batch.status === runStatusFilter;
        const matchesPromotion =
          runPromotionFilter === "all" ||
          (runPromotionFilter === "promoted" && batch.promoted) ||
          (runPromotionFilter === "not-promoted" && !batch.promoted);
        const matchesSamples =
          runSampleFilter === "all" ||
          (runSampleFilter === "selected" && batch.selectedAnnotationCount > 0) ||
          (runSampleFilter === "eligible" &&
            batch.eligibleApprovedAnnotationCount > 0) ||
          (runSampleFilter === "no-selected" &&
            batch.selectedAnnotationCount === 0);
        const matchesFrom = requestedFrom === null || requestedAt >= requestedFrom;
        const matchesTo = requestedTo === null || requestedAt <= requestedTo;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPromotion &&
          matchesSamples &&
          matchesFrom &&
          matchesTo
        );
      });
  }, [
    data,
    runPromotionFilter,
    runRequestedFrom,
    runRequestedTo,
    runSampleFilter,
    runSearch,
    runStatusFilter,
  ]);
  const runTotalPages = Math.max(
    1,
    Math.ceil(filteredBatches.length / runPageSize),
  );
  const safeRunPage = Math.min(runPage, runTotalPages);
  const runPageStart = (safeRunPage - 1) * runPageSize;
  const visibleBatches = filteredBatches.slice(
    runPageStart,
    runPageStart + runPageSize,
  );
  const hasRunFilters =
    runSearch.trim().length > 0 ||
    runStatusFilter !== "all" ||
    runPromotionFilter !== "all" ||
    runSampleFilter !== "all" ||
    runRequestedFrom.length > 0 ||
    runRequestedTo.length > 0;

  useEffect(() => {
    setRunPage(1);
  }, [
    runPageSize,
    runPromotionFilter,
    runRequestedFrom,
    runRequestedTo,
    runSampleFilter,
    runSearch,
    runStatusFilter,
  ]);

  useEffect(() => {
    if (runPage > runTotalPages) {
      setRunPage(runTotalPages);
    }
  }, [runPage, runTotalPages]);

  const resetRunFilters = () => {
    setRunSearch("");
    setRunStatusFilter("all");
    setRunPromotionFilter("all");
    setRunSampleFilter("all");
    setRunRequestedFrom("");
    setRunRequestedTo("");
  };

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setTrainingSection("training")}
          className={[
            "cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
            trainingSection === "training"
              ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]"
              : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50",
          ].join(" ")}
        >
          Huấn luyện mô hình
        </button>
        <button
          type="button"
          onClick={() => setTrainingSection("models")}
          className={[
            "cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
            trainingSection === "models"
              ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]"
              : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50",
          ].join(" ")}
        >
          Mô hình
        </button>
      </div>

      {trainingSection === "training" && (
        <div className="space-y-4">
          <TrainingSamplesPreviewCard
            filters={trainingPreviewFilters}
            form={form}
            onFormChange={handleTrainingFormChange}
            canTrigger={canTrigger}
            onOpenConfirmDialog={() => setDialogOpen(true)}
            onPreviewStateChange={handlePreviewStateChange}
          />
          <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Chi tiết phiên chạy</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer"
          >
            <RefreshIcon isFetching={isFetching} />
            Tải lại
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Chưa có phiên huấn luyện mô hình nào.
          </div>
        ) : (
          <>
          <div className="grid items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.35fr)_repeat(5,minmax(150px,1fr))_auto]">
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-gray-500">Tìm kiếm</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={runSearch}
                  onChange={(event) => setRunSearch(event.target.value)}
                  placeholder="Tìm mã phiên/lượt chạy"
                  className="h-10 bg-white pl-9"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Trạng thái
              </span>
              <Select
                value={runStatusFilter}
                onValueChange={(value) =>
                  setRunStatusFilter(value as RetrainRunStatusFilter)
                }
              >
                <SelectTrigger className="h-10 bg-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="QUEUED">Đang chờ</SelectItem>
                  <SelectItem value="RUNNING">Đang chạy</SelectItem>
                  <SelectItem value="FAILED">Thất bại</SelectItem>
                  <SelectItem value="PROMOTED">Đã đưa vào sử dụng</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-gray-500">Kết quả</span>
              <Select
                value={runPromotionFilter}
                onValueChange={(value) =>
                  setRunPromotionFilter(value as RetrainRunPromotionFilter)
                }
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Kết quả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kết quả</SelectItem>
                  <SelectItem value="promoted">Đã đưa vào sử dụng</SelectItem>
                  <SelectItem value="not-promoted">Chưa đưa vào sử dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-gray-500">
                Mẫu dữ liệu
              </span>
              <Select
                value={runSampleFilter}
                onValueChange={(value) =>
                  setRunSampleFilter(value as RetrainRunSampleFilter)
                }
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Mẫu dữ liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dữ liệu</SelectItem>
                  <SelectItem value="eligible">Có mẫu đủ điều kiện</SelectItem>
                  <SelectItem value="selected">Có mẫu được chọn</SelectItem>
                  <SelectItem value="no-selected">Chưa chọn mẫu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="grid gap-1.5 text-xs font-medium text-gray-500">
              Từ ngày
              <Input
                type="date"
                value={runRequestedFrom}
                onChange={(event) => setRunRequestedFrom(event.target.value)}
                aria-label="Từ ngày tạo"
                className="h-10 bg-white"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-gray-500">
              Đến ngày
              <Input
                type="date"
                value={runRequestedTo}
                onChange={(event) => setRunRequestedTo(event.target.value)}
                aria-label="Đến ngày tạo"
                className="h-10 bg-white"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={resetRunFilters}
              disabled={!hasRunFilters}
              className="h-10 cursor-pointer bg-white"
            >
              Xóa lọc
            </Button>
          </div>

          {filteredBatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Không có phiên chạy phù hợp với bộ lọc hiện tại.
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
              {visibleBatches.map((batch) => {
                const metricLabel = getMetricLabel(batch.metricKey);
                const requiredThreshold = getPromotionGateThreshold(batch);
                const gateResultLabel = getPromotionGateResultLabel(batch);
                const isBatchFailed = batch.status === "FAILED";
                const isLegacyMetric = Boolean(
                  batch.metricKey && !isBenchmarkGateBatch(batch),
                );

                return (
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
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {batch.promoted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={[
                              "font-semibold",
                              batch.promoted
                                ? "text-green-700"
                                : isBatchFailed || batch.status === "REJECTED"
                                ? "text-red-700"
                                : "text-gray-700",
                            ].join(" ")}
                          >
                            {gateResultLabel}
                          </span>
                        </div>
                        {isLegacyMetric && (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-800"
                          >
                            Metric cũ - không dùng cho benchmark hiện tại
                          </Badge>
                        )}
                        {isBatchFailed ? (
                          <div className="line-clamp-2 text-xs text-red-600">
                            {batch.failureReason || "Phiên train lỗi trước khi đánh giá metric."}
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-1 text-xs text-gray-600">
                              <span>
                                {metricLabel}: ứng viên{" "}
                                <strong>{formatMetric(batch.candidateMetric)}</strong>
                              </span>
                              <span>
                                Mốc cần đạt{" "}
                                <strong>{formatMetric(requiredThreshold)}</strong>
                              </span>
                            </div>
                            {batch.promotionReason && (
                              <div className="line-clamp-2 text-xs text-gray-500">
                                {translatePromotionReason(batch.promotionReason, batch.candidateMetric)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(batch.requestedAtUtc)}</TableCell>
                    <TableCell>{batch.runCount}</TableCell>
                  </TableRow>
                  {expandedBatches[batch.batchId] && batch.runs?.map((run) => {
                    const isRunFailed = run.status === "FAILED" || run.status === "failed";

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

                            {isRunFailed && run.message && (
                              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
                                <strong className="text-red-700">Lỗi:</strong>{" "}
                                <span className="text-red-600">{run.message}</span>
                              </div>
                            )}

                            {!isRunFailed && batch.promotionReason && (
                              <div className={[
                                "rounded-md border p-3 text-sm",
                                batch.promoted
                                  ? "border-green-200 bg-green-50 text-green-800"
                                  : "border-amber-200 bg-amber-50 text-amber-800",
                              ].join(" ")}>
                                <strong>{batch.promoted ? "Đã đưa vào sử dụng:" : "Kết quả đánh giá:"}</strong>{" "}
                                {translatePromotionReason(batch.promotionReason, batch.candidateMetric)}
                              </div>
                            )}

                            <TrainingConfigPanel logs={run.logs} />

                            <div className="grid gap-3 lg:grid-cols-4">
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  {metricLabel} — ứng viên
                                </div>
                                <div className={[
                                  "mt-1 text-lg font-semibold",
                                  batch.candidateMetric != null && requiredThreshold != null
                                    ? batch.candidateMetric >= requiredThreshold
                                      ? "text-green-700"
                                      : "text-red-600"
                                    : "text-gray-900",
                                ].join(" ")}>
                                  {formatMetric(batch.candidateMetric)}
                                </div>
                                <div className="mt-1 text-xs text-gray-400">Mô hình vừa huấn luyện</div>
                              </div>
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  {metricLabel} — baseline
                                </div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatMetric(batch.baselineMetric)}
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                  Benchmark hiện tại
                                </div>
                              </div>
                              <div className="rounded-md border border-gray-200 bg-white p-3">
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Mốc cần đạt
                                </div>
                                <div className="mt-1 text-lg font-semibold text-gray-900">
                                  {formatMetric(requiredThreshold)}
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                  Benchmark hiện tại + {formatMetric(batch.minimumImprovement)}
                                </div>
                              </div>
                              <div className={[
                                "rounded-md border p-3",
                                batch.promoted
                                  ? "border-green-200 bg-green-50"
                                  : batch.status === "REJECTED"
                                  ? "border-red-100 bg-red-50"
                                  : batch.status === "FAILED"
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200 bg-white",
                              ].join(" ")}>
                                <div className="text-xs font-semibold uppercase text-gray-500">
                                  Kết quả
                                </div>
                                <div className={[
                                  "mt-1 text-sm font-semibold",
                                  batch.promoted
                                    ? "text-green-700"
                                    : batch.status === "REJECTED" || batch.status === "FAILED"
                                    ? "text-red-700"
                                    : "text-gray-700",
                                ].join(" ")}>
                                  {gateResultLabel}
                                </div>
                                {batch.promotionReason?.toLowerCase().includes("yolo frozen") && (
                                  <div className="mt-1 text-xs text-gray-400">YOLO: cố định, không tái huấn luyện</div>
                                )}
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
                );
              })}
            </TableBody>
            </Table>
          </div>
          )}

          {filteredBatches.length > 0 && (
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Hiển thị {runPageStart + 1}-
                {Math.min(runPageStart + runPageSize, filteredBatches.length)} /{" "}
                {filteredBatches.length} phiên
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={String(runPageSize)}
                  onValueChange={(value) => setRunPageSize(Number(value))}
                >
                  <SelectTrigger className="h-9 w-[116px] bg-white">
                    <SelectValue placeholder="Số dòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETRAIN_RUN_PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} dòng
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRunPage((current) => Math.max(1, current - 1))}
                  disabled={safeRunPage === 1}
                  className="cursor-pointer bg-white"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>
                <span className="min-w-16 text-center font-semibold text-gray-700">
                  {safeRunPage} / {runTotalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRunPage((current) => Math.min(runTotalPages, current + 1))
                  }
                  disabled={safeRunPage === runTotalPages}
                  className="cursor-pointer bg-white"
                >
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </CardContent>
          </Card>
        </div>
      )}

      {trainingSection === "models" && (
        <div className="space-y-4">
          <TrainingModelOverview
            batches={data}
            currentModel={currentModel}
            latestCandidate={latestCandidate}
          />
          <ModelVersionHistory
            versions={sortedModelVersions}
            currentModelId={currentModel?.batchId}
          />
        </div>
      )}

      <StandardDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Xác nhận kích hoạt huấn luyện"
      >
        <div className="space-y-4">
          <div
            className={[
              "rounded-lg border p-4",
              isTrainingReady
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-gray-900">
              {isTrainingReady
                ? "Bộ dữ liệu hiện tại đã sẵn sàng."
                : "Bộ dữ liệu hiện tại chưa đủ điều kiện."}
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Kiểm tra lại các thông số bên dưới trước khi gửi phiên huấn luyện.
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
            <TrainingConfirmSummaryItem
              label="Nguồn dữ liệu"
              value={trainingSourceLabel}
            />
            <TrainingConfirmSummaryItem
              label="Khoảng dữ liệu"
              value={
                trainingPreviewState.data
                  ? `Từ ${formatDate(trainingPreviewState.data.sourceWindowFromUtc)}`
                  : "Chưa tải được"
              }
            />
            <TrainingConfirmSummaryItem
              label="Nhãn đủ điều kiện"
              value={`${approvedAnnotationCount} / tối thiểu ${minApprovedAnnotations}`}
            />
            <TrainingConfirmSummaryItem
              label="Giới hạn mẫu"
              value={trainingPreviewState.data?.maxSamples ?? form.maxSamplesPerBatch}
            />
            <TrainingConfirmSummaryItem
              label="Mẫu hiệu chỉnh"
              value={trainingPreviewState.data?.reviewedSampleCount ?? 0}
            />
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
              disabled={!isTrainingReady || triggerMutation.isPending}
            >
              {triggerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kích hoạt huấn luyện
            </Button>
          </div>
        </div>
      </StandardDialog>
    </div>
  );
}

function TrainingConfirmSummaryItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="text-xs font-semibold uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
