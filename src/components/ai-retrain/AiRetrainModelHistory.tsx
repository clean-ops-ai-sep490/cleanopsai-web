import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScoringRetrainBatchListItem } from "@/types/scoring";
import {
  formatDate,
  formatMetric,
  statusBadgeClass,
  statusLabels,
} from "./ai-retrain-shared";
import {
  getBatchPublishedAt,
  getModelVersionDescription,
  modelVersionName,
} from "./AiRetrainTrainingUtils";

const MODEL_HISTORY_PAGE_SIZE = 6;
function getModelVersionBadge(batch: ScoringRetrainBatchListItem, isCurrent: boolean) {
  if (isCurrent) {
    return {
      label: "Đang sử dụng",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (batch.promoted) {
    return {
      label: "Đã đưa vào sử dụng",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  return {
    label: statusLabels[batch.status] || batch.status,
    className: statusBadgeClass(batch.status),
  };
}

function ModelSummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper: string;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="text-xs font-semibold uppercase text-gray-500">
        {label}
      </div>
      <div className="mt-1 min-h-7 text-lg font-semibold text-gray-950">
        {value}
      </div>
      <div className="mt-1 text-xs text-gray-500">{helper}</div>
    </div>
  );
}

export function TrainingModelOverview({
  batches,
  currentModel,
  latestCandidate,
}: {
  batches: ScoringRetrainBatchListItem[];
  currentModel?: ScoringRetrainBatchListItem;
  latestCandidate?: ScoringRetrainBatchListItem;
}) {
  const releasedCount = batches.filter((batch) => batch.promoted).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan mô hình</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ModelSummaryCard
          label="Mô hình hiện tại"
          value={modelVersionName(currentModel?.batchId)}
          helper={
            currentModel
              ? `Publish: ${formatDate(getBatchPublishedAt(currentModel))}`
              : "Chưa có phiên bản được đưa vào sử dụng"
          }
        />
        <ModelSummaryCard
          label="Ứng viên gần nhất"
          value={modelVersionName(latestCandidate?.batchId)}
          helper={
            latestCandidate
              ? `Train: ${formatDate(latestCandidate.requestedAtUtc)}`
              : "Chưa có mô hình ứng viên"
          }
        />
        <ModelSummaryCard
          label="Đã huấn luyện"
          value={batches.length}
          helper="Tổng số phiên đã tạo trong lịch sử gần đây"
        />
        <ModelSummaryCard
          label="Đã đưa vào sử dụng"
          value={releasedCount}
          helper="Các phiên bản đã qua điều kiện release"
        />
      </CardContent>
    </Card>
  );
}

export function ModelVersionHistory({
  versions,
  currentModelId,
}: {
  versions: ScoringRetrainBatchListItem[];
  currentModelId?: string;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(versions.length / MODEL_HISTORY_PAGE_SIZE));
  const normalizedPage = Math.min(page, totalPages);
  const pageStart = (normalizedPage - 1) * MODEL_HISTORY_PAGE_SIZE;
  const visibleVersions = versions.slice(pageStart, pageStart + MODEL_HISTORY_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [versions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử phiên bản mô hình</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
            Chưa có phiên bản mô hình nào.
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              {visibleVersions.map((batch) => {
                const isCurrent = batch.batchId === currentModelId;
                const publishedAt = getBatchPublishedAt(batch);
                const badge = getModelVersionBadge(batch, isCurrent);

                return (
                  <div
                    key={batch.batchId}
                    className={[
                      "rounded-lg border bg-white p-4",
                      isCurrent
                        ? "border-[#1a80a2] bg-[#f4fbfd]"
                        : "border-gray-200",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-950">
                          {modelVersionName(batch.batchId)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Mô hình phân vùng
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-xs font-semibold uppercase text-gray-500">
                          Ngày train
                        </div>
                        <div className="mt-1 font-medium text-gray-900">
                          {formatDate(batch.requestedAtUtc)}
                        </div>
                      </div>
                      <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-xs font-semibold uppercase text-gray-500">
                          Ngày publish
                        </div>
                        <div className="mt-1 font-medium text-gray-900">
                          {publishedAt ? formatDate(publishedAt) : "Chưa đưa vào sử dụng"}
                        </div>
                      </div>
                      <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-xs font-semibold uppercase text-gray-500">
                          Điểm ứng viên
                        </div>
                        <div className="mt-1 font-medium text-gray-900">
                          {formatMetric(batch.candidateMetric)}
                        </div>
                      </div>
                      <div className="rounded-md bg-gray-50 p-2">
                        <div className="text-xs font-semibold uppercase text-gray-500">
                          Mốc hiện tại
                        </div>
                        <div className="mt-1 font-medium text-gray-900">
                          {formatMetric(batch.baselineMetric)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                      {getModelVersionDescription(batch, isCurrent)}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
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
                  {Math.min(pageStart + MODEL_HISTORY_PAGE_SIZE, versions.length)} /{" "}
                  {versions.length}
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
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
