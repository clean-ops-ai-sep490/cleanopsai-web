import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrainingSamplesPreview } from "@/hooks/useScoringRetrain";
import type {
  ScoringRetrainTrainingSamplesPreview,
  ScoringRetrainTrainingSamplePreviewItem,
  TrainingSamplesPreviewFilters,
  TriggerScoringRetrainRequest,
} from "@/types/scoring";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
} from "lucide-react";
import { formatDate, LoadingSpinner, RefreshIcon } from "./ai-retrain-shared";

const TRAINING_PREVIEW_PAGE_SIZE = 6;
export function TrainingSamplesPreviewCard({
  filters,
  form,
  onFormChange,
  canTrigger,
  onOpenConfirmDialog,
  onPreviewStateChange,
}: {
  filters: TrainingSamplesPreviewFilters;
  form: TriggerScoringRetrainRequest;
  onFormChange: (patch: Partial<TriggerScoringRetrainRequest>) => void;
  canTrigger: boolean;
  onOpenConfirmDialog: () => void;
  onPreviewStateChange?: (state: {
    data?: ScoringRetrainTrainingSamplesPreview;
    isLoading: boolean;
    isFetching: boolean;
    hasError: boolean;
  }) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch, error } =
    useTrainingSamplesPreview(filters);
  const samples = data?.trainingSamples ?? [];
  const minApprovedAnnotations = Math.max(1, form.minApprovedAnnotations || 1);
  const approvedAnnotationCount = data?.approvedAnnotationCount ?? 0;
  const hasError = Boolean(error);
  const isReady =
    Boolean(data) && !isLoading && !hasError && approvedAnnotationCount >= minApprovedAnnotations;
  const canOpenConfirm = canTrigger && isReady;
  const totalPages = Math.max(1, Math.ceil(samples.length / TRAINING_PREVIEW_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * TRAINING_PREVIEW_PAGE_SIZE;
  const visibleSamples = samples.slice(
    pageStart,
    pageStart + TRAINING_PREVIEW_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [filters.lookbackDays, filters.maxSamples, filters.useLastBatchTime]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    onPreviewStateChange?.({
      data,
      isLoading,
      isFetching,
      hasError,
    });
  }, [data, hasError, isFetching, isLoading, onPreviewStateChange]);

  const updateNumberField = (
    field: "lookbackDays" | "minApprovedAnnotations" | "maxSamplesPerBatch",
    rawValue: string,
  ) => {
    const parsed = Number(rawValue);
    onFormChange({
      [field]: Number.isFinite(parsed) ? Math.max(1, parsed) : 1,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Dữ liệu sẽ dùng để huấn luyện</CardTitle>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Chỉ hiển thị các ảnh có nhãn chuẩn đã duyệt và đủ điều kiện đưa vào phiên huấn luyện.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="cursor-pointer"
        >
          <RefreshIcon isFetching={isFetching} />
          Tải lại dữ liệu
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-gray-800">
              Nguồn dữ liệu huấn luyện
            </span>
            <div className="grid gap-2 lg:grid-cols-2">
              <button
                type="button"
                onClick={() => onFormChange({ useLastBatchTime: true })}
                className={[
                  "cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors",
                  form.useLastBatchTime
                    ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50",
                ].join(" ")}
              >
                Từ lần huấn luyện gần nhất
              </button>
              <button
                type="button"
                onClick={() => onFormChange({ useLastBatchTime: false })}
                className={[
                  "cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors",
                  !form.useLastBatchTime
                    ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50",
                ].join(" ")}
              >
                Trong số ngày gần đây
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {!form.useLastBatchTime && (
              <label className="grid gap-1.5 text-xs font-medium text-gray-500">
                Số ngày gần đây
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={form.lookbackDays}
                    onChange={(event) =>
                      updateNumberField("lookbackDays", event.target.value)
                    }
                    className="h-10 bg-white"
                  />
                  <span className="text-sm text-gray-600">ngày</span>
                </div>
              </label>
            )}
            <label className="grid gap-1.5 text-xs font-medium text-gray-500">
              Số nhãn đã duyệt tối thiểu
              <Input
                type="number"
                min={1}
                value={form.minApprovedAnnotations}
                onChange={(event) =>
                  updateNumberField("minApprovedAnnotations", event.target.value)
                }
                className="h-10 bg-white"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-gray-500">
              Giới hạn mẫu
              <Input
                type="number"
                min={1}
                max={5000}
                value={form.maxSamplesPerBatch}
                onChange={(event) =>
                  updateNumberField("maxSamplesPerBatch", event.target.value)
                }
                className="h-10 bg-white"
              />
            </label>
          </div>

        </div>

        <div
          className={[
            "flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between",
            isReady
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            {isReady ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div>
              <div className="font-semibold">
                {isReady ? "Sẵn sàng huấn luyện" : "Chưa đủ dữ liệu"}
              </div>
              <p className="text-sm">
                {isReady
                  ? `Có ${approvedAnnotationCount} nhãn đủ điều kiện, đạt ngưỡng tối thiểu ${minApprovedAnnotations}.`
                  : `Hiện có ${approvedAnnotationCount} / ${minApprovedAnnotations} nhãn đủ điều kiện. Hãy tăng khoảng ngày nhìn lại hoặc giảm ngưỡng tối thiểu.`}
              </p>
            </div>
          </div>
          {canTrigger && (
            <Button
              type="button"
              onClick={onOpenConfirmDialog}
              disabled={!canOpenConfirm}
              className="cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90"
            >
              <Play className="mr-2 h-4 w-4" />
              Kích hoạt với bộ dữ liệu này
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TrainingPreviewStat
            label="Ảnh có nhãn chuẩn"
            value={approvedAnnotationCount}
          />
          <TrainingPreviewStat
            label="Yêu cầu tối thiểu"
            value={minApprovedAnnotations}
          />
          <TrainingPreviewStat
            label="Khoảng dữ liệu"
            value={data ? formatDate(data.sourceWindowFromUtc) : "Đang tải"}
          />
          <TrainingPreviewStat
            label="Giới hạn mẫu"
            value={data?.maxSamples ?? filters.maxSamples}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner className="min-h-[260px]" />
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            Không thể tải dữ liệu huấn luyện. Vui lòng thử tải lại.
          </div>
        ) : samples.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
            Chưa có ảnh đủ điều kiện huấn luyện.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleSamples.map((sample) => (
                <TrainingSamplePreviewCard
                  key={sample.candidateId}
                  sample={sample}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hiển thị {pageStart + 1}-
                {Math.min(pageStart + TRAINING_PREVIEW_PAGE_SIZE, samples.length)} /{" "}
                {samples.length} ảnh
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage === 1}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>
                <span className="min-w-16 text-center font-semibold text-gray-700">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={safePage === totalPages}
                  className="cursor-pointer"
                >
                  Sau
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingPreviewStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function TrainingSamplePreviewCard({
  sample,
}: {
  sample: ScoringRetrainTrainingSamplePreviewItem;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-[4/3] bg-gray-100">
        {!imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sample.imageUrl}
            alt={`Mẫu huấn luyện ${sample.candidateId.slice(0, 8)}`}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
            Không tải được ảnh
          </div>
        )}
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              Mẫu {sample.candidateId.slice(0, 8)}
            </div>
            <div className="truncate text-xs text-gray-500">
              {sample.environmentKey}
            </div>
          </div>
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Nhãn chuẩn
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <div className="font-semibold uppercase text-gray-500">Ngày duyệt</div>
            <div>{formatDate(sample.approvedAtUtc)}</div>
          </div>
          <div>
            <div className="font-semibold uppercase text-gray-500">Version nhãn</div>
            <div>{sample.annotationVersion ? `v${sample.annotationVersion}` : "Chưa có"}</div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full cursor-pointer">
          <Link href={`/supervisor/ai-retrain/annotations/${sample.candidateId}`}>
            <Eye className="mr-2 h-4 w-4" />
            Mở nhãn
          </Link>
        </Button>
      </div>
    </div>
  );
}
