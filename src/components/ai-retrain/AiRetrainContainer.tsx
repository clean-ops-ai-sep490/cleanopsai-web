"use client";

import { useMemo, useState } from "react";
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
  PROMOTED: "Đã promote",
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
  if (!value) return "N/A";
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
      console.error("Failed to review scoring result:", error);
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
                <p className="text-gray-500">Worker</p>
                <p className="font-medium">{item.workerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500">Environment</p>
                <p className="font-medium">{item.environmentKey}</p>
              </div>
              <div>
                <p className="text-gray-500">Quality score</p>
                <p className="font-medium">{item.qualityScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Request</p>
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
                <SelectItem value="PASS">PASS</SelectItem>
                <SelectItem value="FAIL">FAIL</SelectItem>
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
        <CardTitle>Review Queue</CardTitle>
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
            Không có ảnh PENDING cần duyệt.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Score</TableHead>
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
                        alt="Pending scoring"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{item.workerName || "N/A"}</TableCell>
                  <TableCell>{item.environmentKey}</TableCell>
                  <TableCell>{item.qualityScore.toFixed(2)}</TableCell>
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
  const canEditAnnotations = hasRole([UserRole.Manager, UserRole.Admin]);
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
          <CardTitle>Annotation Queue</CardTitle>
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
            placeholder="Environment key"
            className="w-[220px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không có annotation candidate phù hợp.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Annotation</TableHead>
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
                        alt="Annotation candidate"
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
                        href={`/manager/ai-retrain/annotations/${candidate.candidateId}`}
                      >
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Mở
                        </Button>
                      </Link>
                      {canEditAnnotations &&
                        candidate.candidateStatus !== "APPROVED" && (
                          <Link
                            href={`/manager/ai-retrain/annotations/${candidate.candidateId}?mode=edit`}
                          >
                            <Button size="sm">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
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
  const canTrigger = hasRole([UserRole.Manager, UserRole.Admin]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TriggerScoringRetrainRequest>({
    lookbackDays: 7,
    minReviewedSamples: 25,
    minApprovedAnnotations: 5,
    maxSamplesPerBatch: 500,
    includeRejectedTrainingSamples: false,
  });
  const { data = [], isLoading, refetch, isFetching } = useRetrainBatches({
    take: 50,
  });
  const triggerMutation = useTriggerRetrainBatch();

  const handleTrigger = async () => {
    try {
      await triggerMutation.mutateAsync(form);
      toastUtils.success("Đã trigger retrain batch");
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to trigger retrain batch:", error);
      toastUtils.error("Không thể trigger retrain batch");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Retrain Runs</CardTitle>
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
              Trigger retrain
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Chưa có retrain batch.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Samples</TableHead>
                <TableHead>Promotion</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Runs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((batch) => (
                <TableRow key={batch.batchId}>
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
                    <div>Reviewed {batch.reviewedSampleCount}</div>
                    <div>
                      Approved {batch.approvedAnnotationCount} / Eligible{" "}
                      {batch.eligibleApprovedAnnotationCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      Selected {batch.selectedAnnotationCount} / Used{" "}
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
                      <span className="text-sm">
                        {batch.promotionReason || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(batch.requestedAtUtc)}</TableCell>
                  <TableCell>{batch.runCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <StandardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Trigger retrain batch"
      >
        <div className="space-y-4">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Lookback days</label>
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
            <label className="text-sm font-medium">Min reviewed samples</label>
            <Input
              type="number"
              min={1}
              value={form.minReviewedSamples}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minReviewedSamples: Number(event.target.value),
                }))
              }
            />
            <label className="text-sm font-medium">
              Min approved annotations mới
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
            <label className="text-sm font-medium">Max samples per batch</label>
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
              Cho phép dùng lại mẫu từng bị REJECTED
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
              Trigger
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
            AI Retrain Flow
          </h1>
          <p className="mt-1 text-gray-600">
            Duyệt kết quả AI, chuẩn bị annotation và trigger retrain model
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
                Review Queue
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
                Annotation Queue
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="runs"
              className={browserTabTriggerClass}
            >
              <span className={browserTabInnerClass(activeTab === "runs")}>
                <GitBranch className="h-4 w-4" />
                Retrain Runs
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
