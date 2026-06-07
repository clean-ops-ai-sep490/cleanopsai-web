import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { segmentationBenchmarkDataset } from "@/lib/ai-benchmark-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBenchmarkPercent } from "./ai-retrain-shared";

const BENCHMARK_GALLERY_PAGE_SIZE = 6;
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

export function BenchmarkDatasetOverview() {
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

export function BenchmarkOverview() {
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

export function ModelVersions() {
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
