import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastUtils } from "@/lib/utils/toast-utils";
import { UserRole, useRole } from "@/hooks/useRole";
import {
  useAnnotationCandidates,
  usePendingScoringReviews,
  useReviewScoringResult,
} from "@/hooks/useScoringRetrain";
import type {
  PendingScoringReviewItem,
  ScoringAnnotationCandidateListItem,
} from "@/types/scoring";
import { ChevronLeft, ChevronRight, Edit2, Eye, Loader2 } from "lucide-react";
import {
  formatDate,
  LoadingSpinner,
  RefreshIcon,
  statusBadgeClass,
  statusLabels,
} from "./ai-retrain-shared";

type DataQueueStatusFilter =
  | "all"
  | "action-needed"
  | "submitted"
  | "approved"
  | "rejected";

const DATA_QUEUE_PAGE_SIZE = 5;
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
  activeClass: string;
}> = [
  {
    value: "all",
    label: "Tất cả",
    activeClass: "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680]",
  },
  {
    value: "action-needed",
    label: "Cần xử lý",
    activeClass: "border-amber-300 bg-amber-50 text-amber-700",
  },
  {
    value: "submitted",
    label: "Đã gửi",
    activeClass: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "approved",
    label: "Đã duyệt",
    activeClass: "border-green-200 bg-green-50 text-green-700",
  },
  {
    value: "rejected",
    label: "Đã từ chối",
    activeClass: "border-red-200 bg-red-50 text-red-700",
  },
];

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
  onSaved: (
    handledKey: string,
    reviewedVerdict: "PASS" | "FAIL",
    resultId: string,
  ) => Promise<void>;
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
      await onSaved(item.key, verdict, item.review.resultId);
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
  const isApproved = item.annotation.candidateStatus === "APPROVED";
  const hasAnnotation = item.annotation.hasAnnotation;
  const shouldEdit =
    canEditAnnotations &&
    !hasAnnotation &&
    !isApproved;
  const actionHref = shouldEdit
    ? `/supervisor/ai-retrain/annotations/${item.annotation.candidateId}?mode=edit`
    : `/supervisor/ai-retrain/annotations/${item.annotation.candidateId}`;
  const ActionIcon = shouldEdit ? Edit2 : Eye;
  const actionLabel = shouldEdit
    ? "Gắn nhãn"
    : hasAnnotation
      ? "Xem nhãn"
      : "Mở";

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
              {actionLabel}
            </Button>
          </Link>
        </div>
      </div>

      {isApproved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Mẫu này đã có nhãn được duyệt và đang được khóa để làm dữ liệu huấn luyện.
        </div>
      )}

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
  onReviewSaved: (
    handledKey: string,
    reviewedVerdict: "PASS" | "FAIL",
    resultId: string,
  ) => Promise<void>;
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
  const [status, setStatus] = useState<DataQueueStatusFilter>("action-needed");
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

  const handleReviewSaved = async (
    handledKey: string,
    reviewedVerdict: "PASS" | "FAIL",
    resultId: string,
  ) => {
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
    const [, candidatesResult] = await Promise.all([
      refetchReviews(),
      refetchCandidates(),
    ]);
    const createdAnnotationCandidate =
      reviewedVerdict === "FAIL"
        ? candidatesResult.data?.find(
            (candidate) =>
              candidate.resultId === resultId &&
              ["QUEUED", "INPROGRESS"].includes(candidate.candidateStatus),
          )
        : undefined;

    setSelectedQueueKey(
      createdAnnotationCandidate
        ? `annotation-${createdAnnotationCandidate.candidateId}`
        : nextItem?.key ?? null,
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Hàng đợi dữ liệu</CardTitle>
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
                          ? filter.activeClass
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
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

export function DataWorkflow() {
  return <UnifiedDataQueue />;
}

