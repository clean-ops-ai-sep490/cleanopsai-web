import React from "react";
import type { ScoringRetrainBatchListItem } from "@/types/scoring";
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

export function modelVersionName(batchId?: string | null) {
  return batchId ? `Model-${batchId.slice(0, 8)}` : "Chưa có";
}

export function getBatchTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() : 0;
}

export function getBatchPublishedAt(batch: ScoringRetrainBatchListItem) {
  return batch.promoted ? batch.completedAtUtc : null;
}

export function getModelVersionDescription(
  batch: ScoringRetrainBatchListItem,
  isCurrent: boolean,
) {
  if (isCurrent) return "Mô hình hiện tại đang được sử dụng.";
  if (batch.promoted) return "Phiên bản đã từng được đưa vào sử dụng.";
  if (batch.status === "RUNNING" || batch.status === "QUEUED") {
    return "Mô hình ứng viên đang được chuẩn bị.";
  }
  if (batch.status === "FAILED") return "Phiên huấn luyện không hoàn tất.";
  if (batch.status === "REJECTED") return translatePromotionReason(batch.promotionReason);
  return "Mô hình ứng viên chưa được đưa vào sử dụng.";
}

export function translatePromotionReason(reason?: string | null) {
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

export function translateRunMode(mode: string) {
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

export function extractLastNumericMetric(logs: string | null | undefined, key: "map" | "miou") {
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

export function TrainingConfigPanel({ logs }: { logs?: string | null }) {
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
