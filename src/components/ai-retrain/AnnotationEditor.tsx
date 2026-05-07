"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toastUtils } from "@/lib/utils/toast-utils";
import { UserRole, useRole } from "@/hooks/useRole";
import {
  useAnnotationCandidate,
  useApproveAnnotationCandidate,
  useRejectAnnotationCandidate,
  useUpsertScoringAnnotation,
} from "@/hooks/useScoringRetrain";
import type {
  AnnotationLabel,
  AnnotationLabelName,
  ScoringAnnotationCandidateDetail,
} from "@/types/scoring";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

function safeJsonParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeLabels(raw: unknown): AnnotationLabel[] {
  const root = raw as { labels?: unknown } | null;
  const source = Array.isArray(raw)
    ? raw
    : root && typeof root === "object" && Array.isArray(root.labels)
      ? root.labels
      : [];

  return source
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as {
        label?: unknown;
        points?: unknown;
        source?: unknown;
      };
      const label: AnnotationLabelName =
        record.label === "wet_surface" ? "wet_surface" : "stain_or_water";
      const points = record.points;
      if (!Array.isArray(points) || points.length < 2) return null;
      const first = points[0];
      const second = points[1];
      if (!Array.isArray(first) || !Array.isArray(second)) return null;

      return {
        label,
        shapeType: "rectangle" as const,
        source:
          typeof record.source === "string" ? record.source : undefined,
        points: [
          [Number(first[0]) || 0, Number(first[1]) || 0],
          [Number(second[0]) || 0, Number(second[1]) || 0],
        ],
      };
    })
    .filter(Boolean) as AnnotationLabel[];
}

function labelsFromCandidate(candidate: ScoringAnnotationCandidateDetail) {
  if (candidate.annotation?.labelsJson) {
    return normalizeLabels(safeJsonParse(candidate.annotation.labelsJson, []));
  }

  return normalizeLabels(safeJsonParse(candidate.preAnnotationJson, []));
}

function labelColor(label: AnnotationLabelName) {
  return label === "wet_surface" ? "#2563eb" : "#dc2626";
}

function statusBadgeClass(status: string) {
  if (status === "APPROVED") return "bg-green-50 text-green-700 border-green-200";
  if (status === "REJECTED") return "bg-red-50 text-red-700 border-red-200";
  if (["INPROGRESS", "SUBMITTED"].includes(status)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-blue-50 text-blue-700 border-blue-200";
}

const statusLabels: Record<string, string> = {
  QUEUED: "Đang chờ",
  INPROGRESS: "Đang xử lý",
  SUBMITTED: "Đã gửi",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

function LoadingSpinner() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-[#1a80a2]" />
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleString("vi-VN");
}

function AnnotationCanvas({
  imageUrl,
  labels,
  activeLabel,
  readOnly,
  onChange,
}: {
  imageUrl: string;
  labels: AnnotationLabel[];
  activeLabel: AnnotationLabelName;
  readOnly: boolean;
  onChange: (labels: AnnotationLabel[]) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [displaySize, setDisplaySize] = useState({ width: 1, height: 1 });
  const [draftStart, setDraftStart] = useState<Point | null>(null);
  const [draftEnd, setDraftEnd] = useState<Point | null>(null);

  const toImagePoint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const updateDisplaySize = () => {
    const image = imageRef.current;
    if (!image) return;
    setImageSize({
      width: image.naturalWidth || 1,
      height: image.naturalHeight || 1,
    });
    setDisplaySize({
      width: image.clientWidth || 1,
      height: image.clientHeight || 1,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", updateDisplaySize);
    return () => window.removeEventListener("resize", updateDisplaySize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = displaySize.width / imageSize.width;
    const scaleY = displaySize.height / imageSize.height;

    const drawLabel = (label: AnnotationLabel, dashed = false) => {
      const [[x1, y1], [x2, y2]] = label.points;
      const left = Math.min(x1, x2) * scaleX;
      const top = Math.min(y1, y2) * scaleY;
      const width = Math.abs(x2 - x1) * scaleX;
      const height = Math.abs(y2 - y1) * scaleY;
      context.strokeStyle = labelColor(label.label);
      context.fillStyle = `${labelColor(label.label)}22`;
      context.lineWidth = 2;
      context.setLineDash(dashed ? [6, 4] : []);
      context.fillRect(left, top, width, height);
      context.strokeRect(left, top, width, height);
      context.setLineDash([]);
      context.fillStyle = labelColor(label.label);
      context.font = "12px sans-serif";
      context.fillText(label.label, left + 4, Math.max(14, top + 14));
    };

    labels.forEach((label) => drawLabel(label));
    if (draftStart && draftEnd) {
      drawLabel(
        {
          label: activeLabel,
          shapeType: "rectangle",
          points: [
            [draftStart.x, draftStart.y],
            [draftEnd.x, draftEnd.y],
          ],
        },
        true,
      );
    }
  }, [activeLabel, displaySize, draftEnd, draftStart, imageSize, labels]);

  return (
    <div className="relative overflow-hidden rounded-lg border bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Annotation"
        className="block max-h-[640px] w-full object-contain"
        onLoad={updateDisplaySize}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ width: displaySize.width, height: displaySize.height }}
        onMouseDown={(event) => {
          if (readOnly) return;
          const point = toImagePoint(event);
          setDraftStart(point);
          setDraftEnd(point);
        }}
        onMouseMove={(event) => {
          if (readOnly || !draftStart) return;
          setDraftEnd(toImagePoint(event));
        }}
        onMouseUp={(event) => {
          if (readOnly || !draftStart) return;
          const end = toImagePoint(event);
          const width = Math.abs(end.x - draftStart.x);
          const height = Math.abs(end.y - draftStart.y);
          if (width > 4 && height > 4) {
            onChange([
              ...labels,
              {
                label: activeLabel,
                shapeType: "rectangle",
                points: [
                  [draftStart.x, draftStart.y],
                  [end.x, end.y],
                ],
              },
            ]);
          }
          setDraftStart(null);
          setDraftEnd(null);
        }}
        onMouseLeave={() => {
          setDraftStart(null);
          setDraftEnd(null);
        }}
      />
    </div>
  );
}

export function AnnotationEditor() {
  const params = useParams<{ candidateId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = params.candidateId;
  const { hasRole } = useRole();
  const editRequested = searchParams.get("mode") === "edit";
  const canManage = hasRole([UserRole.Supervisor, UserRole.Admin]);
  const { data: candidate, isLoading } = useAnnotationCandidate(candidateId);
  const upsertMutation = useUpsertScoringAnnotation(candidateId);
  const approveMutation = useApproveAnnotationCandidate();
  const rejectMutation = useRejectAnnotationCandidate();
  const [labels, setLabels] = useState<AnnotationLabel[]>([]);
  const [activeLabel, setActiveLabel] =
    useState<AnnotationLabelName>("stain_or_water");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!candidate) return;
    setLabels(labelsFromCandidate(candidate));
    setNote(candidate.annotation?.reviewerNote || "");
  }, [candidate]);

  const imageUrl = useMemo(() => {
    if (!candidate) return "";
    return candidate.imageUrl;
  }, [candidate]);

  const saveAnnotation = async (submit: boolean) => {
    try {
      await upsertMutation.mutateAsync({
        annotationFormat: "bbox-region-v1",
        labels,
        reviewerNote: note.trim() || undefined,
        submit,
      });
      toastUtils.success(submit ? "Đã gửi nhãn" : "Đã lưu nháp");
    } catch (error) {
      console.error("Không thể lưu nhãn:", error);
      toastUtils.error("Không thể lưu nhãn");
    }
  };

  const approve = async () => {
    try {
      await approveMutation.mutateAsync({
        candidateId,
        note: note.trim() || undefined,
      });
      toastUtils.success("Đã duyệt ảnh gán nhãn");
    } catch (error) {
      console.error("Không thể duyệt ảnh gán nhãn:", error);
      toastUtils.error("Không thể duyệt ảnh gán nhãn");
    }
  };

  const reject = async () => {
    try {
      await rejectMutation.mutateAsync({
        candidateId,
        reason: note.trim() || undefined,
      });
      toastUtils.success("Đã từ chối ảnh gán nhãn");
    } catch (error) {
      console.error("Không thể từ chối ảnh gán nhãn:", error);
      toastUtils.error("Không thể từ chối ảnh gán nhãn");
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!candidate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-red-600">Không tìm thấy dữ liệu gán nhãn.</p>
          <Button onClick={() => router.push("/supervisor/ai-retrain")}>
            Quay lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const busy =
    upsertMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;
  const approvedLocked = candidate.candidateStatus === "APPROVED";
  const readOnly = !editRequested || !canManage || approvedLocked;
  const readOnlyMessage = approvedLocked
    ? "Annotation đã duyệt sẽ bị khóa để giữ dữ liệu chuẩn và phục vụ audit retrain."
    : !editRequested
      ? "Bạn đang ở chế độ chỉ xem. Bấm Chỉnh sửa từ danh sách gán nhãn để chỉnh sửa."
      : !canManage
        ? "Tài khoản hiện tại không có quyền chỉnh sửa ảnh gán nhãn."
        : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/supervisor/ai-retrain"
            className="mb-2 inline-flex items-center text-sm text-[#1a80a2]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại quy trình huấn luyện lại AI
          </Link>
          <h1 className="text-2xl font-semibold text-black">
            Ảnh chờ gán nhãn
          </h1>
          <p className="mt-1 text-gray-600">
            {candidate.environmentKey} / {candidate.requestId} /{" "}
            {readOnly ? "Chỉ xem" : "Đang chỉnh sửa"}
          </p>
        </div>
        <Badge variant="outline" className={statusBadgeClass(candidate.candidateStatus)}>
          {statusLabels[candidate.candidateStatus] || candidate.candidateStatus}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {readOnly ? "Ảnh gốc để xem nhãn" : "Ảnh gốc để gán nhãn"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnnotationCanvas
                imageUrl={imageUrl}
                labels={labels}
                activeLabel={activeLabel}
                readOnly={readOnly}
                onChange={setLabels}
              />
            </CardContent>
          </Card>

          {candidate.visualizationBlobUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Ảnh phân tích AI tham chiếu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidate.visualizationBlobUrl}
                    alt="Ảnh phân tích AI tham chiếu"
                    className="block max-h-[520px] w-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Công cụ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readOnlyMessage && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                  {readOnlyMessage}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Loại nhãn</label>
                <Select
                  value={activeLabel}
                  disabled={readOnly}
                  onValueChange={(value) =>
                    setActiveLabel(value as AnnotationLabelName)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stain_or_water">
                      Vết bẩn hoặc nước
                    </SelectItem>
                    <SelectItem value="wet_surface">Bề mặt ướt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Ghi chú</label>
                <Textarea
                  value={note}
                  disabled={readOnly}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ghi chú của người duyệt"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Nhãn đã vẽ ({labels.length})</p>
                <div className="max-h-[240px] space-y-2 overflow-y-auto">
                  {labels.map((label, index) => (
                    <div
                      key={`${label.label}-${index}`}
                      className="flex items-center justify-between rounded border p-2 text-sm"
                    >
                      <span>
                        {label.label} #{index + 1}
                      </span>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() =>
                            setLabels((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {labels.length === 0 && (
                    <p className="rounded border p-3 text-sm text-gray-500">
                      Chưa vẽ vùng nào.
                    </p>
                  )}
                </div>
              </div>

              {!readOnly && (
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => saveAnnotation(false)}
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#1a80a2]" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu nháp
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => saveAnnotation(true)}
                    className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Gửi nhãn
                  </Button>
                  <Button
                    disabled={busy || labels.length === 0}
                    onClick={approve}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Duyệt
                  </Button>
                  <Button
                    disabled={busy}
                    variant="outline"
                    onClick={reject}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-700" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Từ chối
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Ngày tạo:</span>{" "}
                {formatDate(candidate.createdAtUtc)}
              </p>
              <p>
                <span className="text-gray-500">Ngày gửi:</span>{" "}
                {formatDate(candidate.submittedAtUtc)}
              </p>
              <p>
                <span className="text-gray-500">Ngày duyệt:</span>{" "}
                {formatDate(candidate.approvedAtUtc)}
              </p>
              <p className="break-all">
                <span className="text-gray-500">Mã kết quả:</span>{" "}
                {candidate.resultId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
