"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Brush,
  CheckCircle2,
  Eraser,
  Hand,
  Loader2,
  Redo2,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
  XCircle,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type ToolMode = "brush" | "pan" | "erase";

const DEFAULT_BRUSH_SIZE = 28;
const MIN_BRUSH_SIZE = 6;
const MAX_BRUSH_SIZE = 80;
const MIN_BRUSH_POINTS = 1;
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const MASK_MAX_SIDE = 1600;
const MIN_MERGED_COMPONENT_PIXELS = 8;
const MERGED_POLYGON_SIMPLIFY_EPSILON = 2;

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampPanForZoom(pan: Point, zoom: number, viewportSize: Size) {
  const scaledWidth = viewportSize.width * zoom;
  const scaledHeight = viewportSize.height * zoom;

  return {
    x:
      scaledWidth <= viewportSize.width
        ? (viewportSize.width - scaledWidth) / 2
        : clampNumber(pan.x, viewportSize.width - scaledWidth, 0),
    y:
      scaledHeight <= viewportSize.height
        ? (viewportSize.height - scaledHeight) / 2
        : clampNumber(pan.y, viewportSize.height - scaledHeight, 0),
  };
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampPointToImage(
  point: Point,
  imageSize: { width: number; height: number },
): [number, number] {
  return [
    Math.max(0, Math.min(imageSize.width, point.x)),
    Math.max(0, Math.min(imageSize.height, point.y)),
  ];
}

function circlePolygon(
  center: Point,
  radius: number,
  imageSize: { width: number; height: number },
) {
  const segments = 18;
  return Array.from({ length: segments }, (_, index) => {
    const angle = (Math.PI * 2 * index) / segments;
    return clampPointToImage(
      {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      },
      imageSize,
    );
  });
}

function simplifyStroke(points: Point[], minDistance: number) {
  return points.reduce<Point[]>((result, point) => {
    const last = result[result.length - 1];
    if (!last || distanceBetween(last, point) >= minDistance) {
      result.push(point);
    }
    return result;
  }, []);
}

function brushStrokeToPolygon(
  points: Point[],
  radius: number,
  imageSize: { width: number; height: number },
) {
  const simplified = simplifyStroke(points, Math.max(2, radius * 0.45));
  if (simplified.length === 0) return [];
  if (simplified.length === 1) {
    return circlePolygon(simplified[0], radius, imageSize);
  }

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  simplified.forEach((point, index) => {
    const prev = simplified[Math.max(0, index - 1)];
    const next = simplified[Math.min(simplified.length - 1, index + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const length = Math.hypot(dx, dy) || 1;
    const normal = { x: -dy / length, y: dx / length };

    left.push(
      clampPointToImage(
        { x: point.x + normal.x * radius, y: point.y + normal.y * radius },
        imageSize,
      ),
    );
    right.push(
      clampPointToImage(
        { x: point.x - normal.x * radius, y: point.y - normal.y * radius },
        imageSize,
      ),
    );
  });

  return [...left, ...right.reverse()];
}

function isBrushPolygon(label: AnnotationLabel) {
  return label.shapeType === "polygon" && label.source === "brush";
}

interface GridPoint {
  x: number;
  y: number;
}

interface BoundaryEdge {
  start: GridPoint;
  end: GridPoint;
}

function gridPointKey(point: GridPoint) {
  return `${point.x}:${point.y}`;
}

function boundaryEdgeKey(edge: BoundaryEdge) {
  return `${gridPointKey(edge.start)}>${gridPointKey(edge.end)}`;
}

function polygonArea(points: Point[] | GridPoint[]) {
  return points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length];
    return area + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function removeCollinearPoints(points: Point[]) {
  return points.filter((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const area =
      (point.x - previous.x) * (next.y - previous.y) -
      (point.y - previous.y) * (next.x - previous.x);

    return Math.abs(area) > 0.01;
  });
}

function perpendicularDistance(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distanceBetween(point, start);

  const ratio = clampNumber(
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
    0,
    1,
  );
  const projected = {
    x: start.x + ratio * dx,
    y: start.y + ratio * dy,
  };

  return distanceBetween(point, projected);
}

function simplifyPolyline(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let splitIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }

  if (maxDistance <= epsilon) return [start, end];

  const left = simplifyPolyline(points.slice(0, splitIndex + 1), epsilon);
  const right = simplifyPolyline(points.slice(splitIndex), epsilon);
  return [...left.slice(0, -1), ...right];
}

function simplifyClosedPolygon(points: Point[]) {
  const withoutCollinear = removeCollinearPoints(points);
  if (withoutCollinear.length <= 3) return withoutCollinear;

  const closed = [...withoutCollinear, withoutCollinear[0]];
  const simplified = simplifyPolyline(
    closed,
    MERGED_POLYGON_SIMPLIFY_EPSILON,
  ).slice(0, -1);

  return simplified.length >= 3 ? simplified : withoutCollinear;
}

function addBoundaryEdge(
  edges: BoundaryEdge[],
  start: GridPoint,
  end: GridPoint,
) {
  edges.push({ start, end });
}

function traceBoundaryLoops(edges: BoundaryEdge[]) {
  const outgoing = new Map<string, BoundaryEdge[]>();
  const unused = new Set(edges.map(boundaryEdgeKey));
  const loops: GridPoint[][] = [];

  edges.forEach((edge) => {
    const key = gridPointKey(edge.start);
    outgoing.set(key, [...(outgoing.get(key) || []), edge]);
  });

  edges.forEach((edge) => {
    const firstKey = boundaryEdgeKey(edge);
    if (!unused.has(firstKey)) return;

    const loop = [edge.start, edge.end];
    let current = edge.end;
    unused.delete(firstKey);

    while (gridPointKey(current) !== gridPointKey(edge.start)) {
      const next = (outgoing.get(gridPointKey(current)) || []).find(
        (candidate) => unused.has(boundaryEdgeKey(candidate)),
      );

      if (!next) break;

      unused.delete(boundaryEdgeKey(next));
      loop.push(next.end);
      current = next.end;
    }

    if (gridPointKey(current) === gridPointKey(edge.start) && loop.length >= 4) {
      loops.push(loop.slice(0, -1));
    }
  });

  return loops;
}

function componentToPolygon(
  componentPixels: number[],
  componentSet: Set<number>,
  maskWidth: number,
  maskHeight: number,
  scale: number,
  imageSize: Size,
) {
  const edges: BoundaryEdge[] = [];

  componentPixels.forEach((pixelIndex) => {
    const x = pixelIndex % maskWidth;
    const y = Math.floor(pixelIndex / maskWidth);

    if (y === 0 || !componentSet.has(pixelIndex - maskWidth)) {
      addBoundaryEdge(edges, { x, y }, { x: x + 1, y });
    }
    if (x === maskWidth - 1 || !componentSet.has(pixelIndex + 1)) {
      addBoundaryEdge(edges, { x: x + 1, y }, { x: x + 1, y: y + 1 });
    }
    if (y === maskHeight - 1 || !componentSet.has(pixelIndex + maskWidth)) {
      addBoundaryEdge(edges, { x: x + 1, y: y + 1 }, { x, y: y + 1 });
    }
    if (x === 0 || !componentSet.has(pixelIndex - 1)) {
      addBoundaryEdge(edges, { x, y: y + 1 }, { x, y });
    }
  });

  const outerLoop = traceBoundaryLoops(edges).sort(
    (a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)),
  )[0];

  if (!outerLoop || outerLoop.length < 3) return [];

  const polygon = simplifyClosedPolygon(
    outerLoop.map((point) => ({
      x: clampNumber(point.x / scale, 0, imageSize.width),
      y: clampNumber(point.y / scale, 0, imageSize.height),
    })),
  );

  return polygon.map((point) => clampPointToImage(point, imageSize));
}

function extractMaskComponents(mask: Uint8ClampedArray, width: number, height: number) {
  const visited = new Uint8Array(width * height);
  const components: number[][] = [];
  const neighborOffsets = [-width, -1, 1, width];

  for (let index = 0; index < visited.length; index += 1) {
    if (visited[index] || mask[index * 4 + 3] === 0) continue;

    const component: number[] = [];
    const queue = [index];
    visited[index] = 1;

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor];
      const x = current % width;
      component.push(current);

      neighborOffsets.forEach((offset) => {
        const next = current + offset;
        if (next < 0 || next >= visited.length || visited[next]) return;

        const nextX = next % width;
        if (Math.abs(nextX - x) > 1) return;
        if (mask[next * 4 + 3] === 0) return;

        visited[next] = 1;
        queue.push(next);
      });
    }

    if (component.length >= MIN_MERGED_COMPONENT_PIXELS) {
      components.push(component);
    }
  }

  return components;
}

function mergeBrushLabels(labels: AnnotationLabel[], imageSize: Size) {
  if (typeof document === "undefined") return labels;

  const brushGroups = new Map<AnnotationLabelName, AnnotationLabel[]>();
  const preservedLabels: AnnotationLabel[] = [];

  labels.forEach((label) => {
    if (!isBrushPolygon(label)) {
      preservedLabels.push(label);
      return;
    }

    const group = brushGroups.get(label.label) || [];
    group.push(label);
    brushGroups.set(label.label, group);
  });

  if (brushGroups.size === 0) return labels;

  const scale = Math.min(
    1,
    MASK_MAX_SIDE / Math.max(imageSize.width, imageSize.height),
  );
  const maskWidth = Math.max(1, Math.ceil(imageSize.width * scale));
  const maskHeight = Math.max(1, Math.ceil(imageSize.height * scale));
  const mergedBrushLabels: AnnotationLabel[] = [];

  brushGroups.forEach((group, labelName) => {
    const canvas = document.createElement("canvas");
    canvas.width = maskWidth;
    canvas.height = maskHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      mergedBrushLabels.push(...group);
      return;
    }

    context.clearRect(0, 0, maskWidth, maskHeight);
    context.fillStyle = "#000";

    group.forEach((label) => {
      if (label.points.length < 3) return;

      context.beginPath();
      label.points.forEach(([x, y], index) => {
        const nextX = x * scale;
        const nextY = y * scale;
        if (index === 0) {
          context.moveTo(nextX, nextY);
        } else {
          context.lineTo(nextX, nextY);
        }
      });
      context.closePath();
      context.fill();
    });

    const imageData = context.getImageData(0, 0, maskWidth, maskHeight);
    const components = extractMaskComponents(imageData.data, maskWidth, maskHeight);

    components.forEach((component) => {
      const polygon = componentToPolygon(
        component,
        new Set(component),
        maskWidth,
        maskHeight,
        scale,
        imageSize,
      );
      if (polygon.length < 3) return;

      mergedBrushLabels.push({
        label: labelName,
        shapeType: "polygon",
        source: "brush",
        points: polygon,
      });
    });
  });

  return [...preservedLabels, ...mergedBrushLabels];
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
        shapeType?: unknown;
        points?: unknown;
        source?: unknown;
      };
      const label: AnnotationLabelName =
        record.label === "wet_surface" ? "wet_surface" : "dirty_area";
      const shapeType: AnnotationLabel["shapeType"] =
        String(record.shapeType || "").toLowerCase() === "polygon"
          ? "polygon"
          : "rectangle";
      const points = record.points;
      if (!Array.isArray(points) || points.length < 2) return null;

      const normalizedPoints = points
        .map((point) => {
          if (!Array.isArray(point) || point.length < 2) return null;
          return [Number(point[0]) || 0, Number(point[1]) || 0] as [
            number,
            number,
          ];
        })
        .filter(Boolean) as Array<[number, number]>;

      if (
        (shapeType === "rectangle" && normalizedPoints.length < 2) ||
        (shapeType === "polygon" && normalizedPoints.length < 3)
      ) {
        return null;
      }

      return {
        label,
        shapeType,
        source:
          typeof record.source === "string" ? record.source : undefined,
        points:
          shapeType === "rectangle"
            ? [normalizedPoints[0], normalizedPoints[1]]
            : normalizedPoints,
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

function labelDisplayName(label: AnnotationLabelName) {
  return label === "wet_surface" ? "Bề mặt ướt" : "Vùng bẩn";
}

function shapeLabel(label: AnnotationLabel) {
  if (isBrushPolygon(label)) return "Vùng tô";
  return label.shapeType === "polygon" ? "Đa giác" : "Khung chữ nhật";
}

function pointInRectangle(point: Point, points: Array<[number, number]>) {
  if (points.length < 2) return false;
  const [[x1, y1], [x2, y2]] = points;
  return (
    point.x >= Math.min(x1, x2) &&
    point.x <= Math.max(x1, x2) &&
    point.y >= Math.min(y1, y2) &&
    point.y <= Math.max(y1, y2)
  );
}

function pointInPolygon(point: Point, points: Array<[number, number]>) {
  if (points.length < 3) return false;
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || 1) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function labelContainsPoint(label: AnnotationLabel, point: Point) {
  if (label.shapeType === "rectangle") {
    return pointInRectangle(point, label.points);
  }

  return pointInPolygon(point, label.points);
}

function findTopmostLabelIndex(labels: AnnotationLabel[], point: Point) {
  for (let index = labels.length - 1; index >= 0; index -= 1) {
    if (labelContainsPoint(labels[index], point)) return index;
  }

  return null;
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
  toolMode,
  brushSize,
  zoom,
  pan,
  selectedLabelIndex,
  readOnly,
  onPanChange,
  onViewportSizeChange,
  onSelectLabel,
  onChange,
}: {
  imageUrl: string;
  labels: AnnotationLabel[];
  activeLabel: AnnotationLabelName;
  toolMode: ToolMode;
  brushSize: number;
  zoom: number;
  pan: Point;
  selectedLabelIndex: number | null;
  readOnly: boolean;
  onPanChange: (pan: Point) => void;
  onViewportSizeChange: (size: Size) => void;
  onSelectLabel: (index: number | null) => void;
  onChange: (labels: AnnotationLabel[]) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [displaySize, setDisplaySize] = useState({ width: 1, height: 1 });
  const [brushPoints, setBrushPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredLabelIndex, setHoveredLabelIndex] = useState<number | null>(
    null,
  );
  const [panDraft, setPanDraft] = useState<{
    pointer: Point;
    pan: Point;
  } | null>(null);

  const toImagePoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
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

  const updateDisplaySize = useCallback(() => {
    const image = imageRef.current;
    if (!image) return;
    const nextDisplaySize = {
      width: image.clientWidth || 1,
      height: image.clientHeight || 1,
    };

    setImageSize({
      width: image.naturalWidth || 1,
      height: image.naturalHeight || 1,
    });
    setDisplaySize(nextDisplaySize);
    onViewportSizeChange(nextDisplaySize);
  }, [onViewportSizeChange]);

  useEffect(() => {
    window.addEventListener("resize", updateDisplaySize);
    return () => window.removeEventListener("resize", updateDisplaySize);
  }, [updateDisplaySize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = displaySize.width / imageSize.width;
    const scaleY = displaySize.height / imageSize.height;

    const drawPolygon = (
      points: Array<[number, number]>,
      label: AnnotationLabelName,
      dashed = false,
    ) => {
      if (points.length < 2) return;
      const scaled = points.map(([x, y]) => [x * scaleX, y * scaleY]);
      const [firstX, firstY] = scaled[0];
      context.strokeStyle = labelColor(label);
      context.fillStyle = `${labelColor(label)}22`;
      context.lineWidth = 2;
      context.setLineDash(dashed ? [6, 4] : []);
      context.beginPath();
      context.moveTo(firstX, firstY);
      scaled.slice(1).forEach(([x, y]) => context.lineTo(x, y));
      if (!dashed && points.length > 2) {
        context.closePath();
        context.fill();
      }
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = labelColor(label);
      context.font = "12px sans-serif";
      context.fillText(
        labelDisplayName(label),
        firstX + 4,
        Math.max(14, firstY + 14),
      );
    };

    const drawLabel = (
      label: AnnotationLabel,
      dashed = false,
      highlighted = false,
    ) => {
      context.strokeStyle = labelColor(label.label);
      context.fillStyle = `${labelColor(label.label)}22`;
      context.lineWidth = highlighted ? 4 : 2;
      context.setLineDash(dashed ? [6, 4] : []);
      if (label.shapeType === "polygon") {
        drawPolygon(label.points, label.label, dashed);
        if (highlighted) {
          drawPolygon(label.points, label.label, true);
        }
      } else {
        const [[x1, y1], [x2, y2]] = label.points;
        const left = Math.min(x1, x2) * scaleX;
        const top = Math.min(y1, y2) * scaleY;
        const width = Math.abs(x2 - x1) * scaleX;
        const height = Math.abs(y2 - y1) * scaleY;
        context.fillRect(left, top, width, height);
        context.strokeRect(left, top, width, height);
        context.setLineDash([]);
        context.fillStyle = labelColor(label.label);
        context.font = "12px sans-serif";
        context.fillText(
          labelDisplayName(label.label),
          left + 4,
          Math.max(14, top + 14),
        );
      }
    };

    const drawBrushPreview = () => {
      if (brushPoints.length < MIN_BRUSH_POINTS) return;
      const scaled = brushPoints.map((point) => ({
        x: point.x * scaleX,
        y: point.y * scaleY,
      }));
      context.strokeStyle = labelColor(activeLabel);
      context.fillStyle = `${labelColor(activeLabel)}33`;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = brushSize;
      context.setLineDash([]);
      context.beginPath();
      context.moveTo(scaled[0].x, scaled[0].y);
      scaled.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
      if (scaled.length === 1) {
        context.beginPath();
        context.arc(
          scaled[0].x,
          scaled[0].y,
          brushSize / 2,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    };

    labels.forEach((label, index) =>
      drawLabel(
        label,
        false,
        index === hoveredLabelIndex || index === selectedLabelIndex,
      ),
    );
    drawBrushPreview();
  }, [
    activeLabel,
    brushPoints,
    brushSize,
    displaySize,
    hoveredLabelIndex,
    imageSize,
    labels,
    selectedLabelIndex,
  ]);

  useEffect(() => {
    setBrushPoints([]);
    setIsDrawing(false);
    setPanDraft(null);
    setHoveredLabelIndex(null);
  }, [readOnly, toolMode]);

  const finishBrushStroke = (points: Point[]) => {
    if (readOnly || points.length < MIN_BRUSH_POINTS) return;
    const scaleX = displaySize.width / imageSize.width;
    const scaleY = displaySize.height / imageSize.height;
    const averageScale = Math.max(0.01, (scaleX + scaleY) / 2);
    const radius = brushSize / 2 / averageScale;
    const polygon = brushStrokeToPolygon(points, radius, imageSize);
    if (polygon.length < 3) return;

    onChange(
      mergeBrushLabels(
        [
          ...labels,
          {
            label: activeLabel,
            shapeType: "polygon",
            source: "brush",
            points: polygon,
          },
        ],
        imageSize,
      ),
    );
  };

  const eraseLabelAtPoint = (point: Point) => {
    const index = findTopmostLabelIndex(labels, point);
    if (index === null) {
      onSelectLabel(null);
      return;
    }

    onSelectLabel(null);
    setHoveredLabelIndex(null);
    onChange(labels.filter((_, labelIndex) => labelIndex !== index));
  };

  const canvasCursorClass = readOnly
    ? "cursor-default"
    : toolMode === "pan"
      ? "cursor-grab active:cursor-grabbing"
      : toolMode === "erase"
        ? "cursor-cell"
        : "cursor-crosshair";

  return (
    <div className="space-y-2">
      <div
        className="relative overflow-hidden rounded-lg border bg-gray-50"
      >
        <div
          className="relative"
          style={{
            transform: `matrix(${zoom}, 0, 0, ${zoom}, ${pan.x}, ${pan.y})`,
            transformOrigin: "0 0",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Ảnh đang gán nhãn"
            className="block max-h-[640px] w-full object-contain"
            onLoad={updateDisplaySize}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${canvasCursorClass}`}
            data-brush-size={brushSize}
            style={{ width: displaySize.width, height: displaySize.height }}
            onPointerDown={(event) => {
              if (readOnly) return;
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);

              if (toolMode === "pan") {
                setPanDraft({
                  pointer: { x: event.clientX, y: event.clientY },
                  pan,
                });
                return;
              }

              const point = toImagePoint(event);
              if (toolMode === "erase") {
                eraseLabelAtPoint(point);
                return;
              }

              setBrushPoints([point]);
              setIsDrawing(true);
            }}
            onPointerMove={(event) => {
              if (readOnly) return;
              event.preventDefault();

              if (toolMode === "pan" && panDraft) {
                onPanChange({
                  x: panDraft.pan.x + event.clientX - panDraft.pointer.x,
                  y: panDraft.pan.y + event.clientY - panDraft.pointer.y,
                });
                return;
              }

              const point = toImagePoint(event);
              if (toolMode === "erase") {
                setHoveredLabelIndex(findTopmostLabelIndex(labels, point));
                return;
              }

              if (!isDrawing) return;
              setBrushPoints((current) => {
                const last = current[current.length - 1];
                if (last && distanceBetween(last, point) < 1) return current;
                return [...current, point];
              });
            }}
            onPointerUp={(event) => {
              if (readOnly) return;
              event.preventDefault();

              if (toolMode === "pan") {
                setPanDraft(null);
              } else if (toolMode === "brush" && isDrawing) {
                const end = toImagePoint(event);
                const points = [...brushPoints, end];
                finishBrushStroke(points);
                setBrushPoints([]);
                setIsDrawing(false);
              }

              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              setBrushPoints([]);
              setIsDrawing(false);
              setPanDraft(null);
            }}
            onPointerLeave={() => {
              if (toolMode === "erase") setHoveredLabelIndex(null);
            }}
          />
        </div>
      </div>
      {!readOnly && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          Dùng cọ để tô vùng, kéo ảnh bằng công cụ bàn tay khi phóng to, hoặc
          dùng tẩy để bấm xóa nguyên vùng nhãn.
        </div>
      )}
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
    useState<AnnotationLabelName>("dirty_area");
  const [toolMode, setToolMode] = useState<ToolMode>("brush");
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [canvasViewportSize, setCanvasViewportSize] = useState<Size>({
    width: 1,
    height: 1,
  });
  const [selectedLabelIndex, setSelectedLabelIndex] = useState<number | null>(
    null,
  );
  const [labelHistory, setLabelHistory] = useState<{
    past: AnnotationLabel[][];
    future: AnnotationLabel[][];
  }>({ past: [], future: [] });
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!candidate) return;
    setLabels(labelsFromCandidate(candidate));
    setLabelHistory({ past: [], future: [] });
    setSelectedLabelIndex(null);
    setZoom(DEFAULT_ZOOM);
    setPan({ x: 0, y: 0 });
    setNote(candidate.annotation?.reviewerNote || "");
  }, [candidate]);

  const imageUrl = useMemo(() => {
    if (!candidate) return "";
    return candidate.imageUrl;
  }, [candidate]);

  useEffect(() => {
    if (selectedLabelIndex !== null && selectedLabelIndex >= labels.length) {
      setSelectedLabelIndex(null);
    }
  }, [labels.length, selectedLabelIndex]);

  const commitLabels = (nextLabels: AnnotationLabel[]) => {
    setLabelHistory((current) => ({
      past: [...current.past, labels],
      future: [],
    }));
    setLabels(nextLabels);
  };

  const undoLabels = () => {
    setLabelHistory((current) => {
      const previous = current.past[current.past.length - 1];
      if (!previous) return current;

      setLabels(previous);
      setSelectedLabelIndex(null);
      return {
        past: current.past.slice(0, -1),
        future: [labels, ...current.future],
      };
    });
  };

  const redoLabels = () => {
    setLabelHistory((current) => {
      const next = current.future[0];
      if (!next) return current;

      setLabels(next);
      setSelectedLabelIndex(null);
      return {
        past: [...current.past, labels],
        future: current.future.slice(1),
      };
    });
  };

  const updateCanvasViewportSize = (size: Size) => {
    setCanvasViewportSize(size);
    setPan((current) => clampPanForZoom(current, zoom, size));
  };

  const updatePan = (nextPan: Point) => {
    setPan(clampPanForZoom(nextPan, zoom, canvasViewportSize));
  };

  const changeZoom = (nextZoom: number) => {
    const clampedZoom = clampNumber(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const viewportCenter = {
      x: canvasViewportSize.width / 2,
      y: canvasViewportSize.height / 2,
    };
    const imagePointAtCenter = {
      x: (viewportCenter.x - pan.x) / zoom,
      y: (viewportCenter.y - pan.y) / zoom,
    };
    const nextPan = {
      x: viewportCenter.x - imagePointAtCenter.x * clampedZoom,
      y: viewportCenter.y - imagePointAtCenter.y * clampedZoom,
    };

    setZoom(clampedZoom);
    setPan(clampPanForZoom(nextPan, clampedZoom, canvasViewportSize));
  };

  const resetViewport = () => {
    setZoom(DEFAULT_ZOOM);
    setPan({ x: 0, y: 0 });
  };

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
    ? "Nhãn đã duyệt sẽ bị khóa để giữ dữ liệu chuẩn và phục vụ kiểm tra huấn luyện lại."
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
                toolMode={toolMode}
                brushSize={brushSize}
                zoom={zoom}
                pan={pan}
                selectedLabelIndex={selectedLabelIndex}
                readOnly={readOnly}
                onPanChange={updatePan}
                onViewportSizeChange={updateCanvasViewportSize}
                onSelectLabel={setSelectedLabelIndex}
                onChange={commitLabels}
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
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Dùng cọ để tô sát vùng bẩn hoặc bề mặt ướt. Hệ thống sẽ lưu
                  nét vẽ thành vùng đa giác để dùng khi huấn luyện lại.
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Công cụ vẽ</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={toolMode === "brush" ? "default" : "outline"}
                    size="sm"
                    disabled={readOnly}
                    onClick={() => setToolMode("brush")}
                  >
                    <Brush className="h-4 w-4" />
                    Cọ
                  </Button>
                  <Button
                    type="button"
                    variant={toolMode === "pan" ? "default" : "outline"}
                    size="sm"
                    disabled={readOnly}
                    onClick={() => setToolMode("pan")}
                  >
                    <Hand className="h-4 w-4" />
                    Kéo ảnh
                  </Button>
                  <Button
                    type="button"
                    variant={toolMode === "erase" ? "default" : "outline"}
                    size="sm"
                    disabled={readOnly}
                    onClick={() => setToolMode("erase")}
                  >
                    <Eraser className="h-4 w-4" />
                    Tẩy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">Kích cỡ cọ</label>
                  <span className="text-xs font-medium text-slate-500">
                    {brushSize}px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-slate-50">
                    <span
                      className="rounded-full"
                      style={{
                        width: Math.max(6, Math.min(32, brushSize / 2)),
                        height: Math.max(6, Math.min(32, brushSize / 2)),
                        backgroundColor: labelColor(activeLabel),
                        opacity: 0.72,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={MIN_BRUSH_SIZE}
                    max={MAX_BRUSH_SIZE}
                    value={brushSize}
                    disabled={readOnly}
                    onChange={(event) => setBrushSize(Number(event.target.value))}
                    className="h-2 w-full accent-[#1a80a2]"
                    aria-label="Kích cỡ cọ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium">Phóng to/thu nhỏ</label>
                  <span className="text-xs font-medium text-slate-500">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={() => changeZoom(zoom - ZOOM_STEP)}
                  >
                    <ZoomOut className="h-4 w-4" />
                    Thu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetViewport}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Về mặc định
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() => changeZoom(zoom + ZOOM_STEP)}
                  >
                    <ZoomIn className="h-4 w-4" />
                    Phóng
                  </Button>
                </div>
                <input
                  type="range"
                  min={MIN_ZOOM * 100}
                  max={MAX_ZOOM * 100}
                  step={ZOOM_STEP * 100}
                  value={Math.round(zoom * 100)}
                  onChange={(event) => changeZoom(Number(event.target.value) / 100)}
                  className="h-2 w-full accent-[#1a80a2]"
                  aria-label="Phóng to hoặc thu nhỏ ảnh"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={readOnly || labelHistory.past.length === 0}
                  onClick={undoLabels}
                >
                  <Undo2 className="h-4 w-4" />
                  Hoàn tác
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={readOnly || labelHistory.future.length === 0}
                  onClick={redoLabels}
                >
                  <Redo2 className="h-4 w-4" />
                  Làm lại
                </Button>
              </div>

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
                    <SelectItem value="dirty_area">Vùng bẩn</SelectItem>
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
                      className={`flex items-center justify-between rounded border p-2 text-sm ${
                        selectedLabelIndex === index
                          ? "border-[#1a80a2] bg-[#1a80a2]/5"
                          : "border-slate-200 bg-white"
                      }`}
                      onClick={() => setSelectedLabelIndex(index)}
                    >
                      <span>
                        {labelDisplayName(label.label)} / {shapeLabel(label)} #
                        {index + 1}
                      </span>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedLabelIndex(null);
                            commitLabels(
                              labels.filter((_, labelIndex) => labelIndex !== index),
                            );
                          }}
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
