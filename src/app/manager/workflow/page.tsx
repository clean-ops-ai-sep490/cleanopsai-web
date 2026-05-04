"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationWithInfo } from "@/components/ui/pagination";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Search, Plus, Workflow as WorkflowIcon } from "lucide-react";
import { useSOPs } from "@/hooks/useSOPs";
import { usePagination } from "@/hooks/usePagination";
import { translateServiceType } from "@/lib/utils/translate";

export default function WorkflowListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const pagination = usePagination({ initialPageSize: 9 });
  const { data, isLoading, error, refetch } = useSOPs({
    pageNumber: pagination.currentPage,
    pageSize: pagination.pageSize,
    search: searchQuery || undefined,
  });

  const sops = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const stats = useMemo(() => {
    const totalSteps = sops.reduce((sum: number, sop: any) => sum + (sop.stepCount || 0), 0);
    return {
      total: totalElements,
      averageSteps: sops.length ? Math.round(totalSteps / sops.length) : 0,
    };
  }, [sops, totalElements]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Thiết lập quy trình"
          description="Quản lý các quy trình SOP theo hướng rõ ràng, dễ xem và dễ mở chi tiết."
          action={
            <Button asChild>
              <Link href="/manager/workflow/create">
                <Plus className="h-4 w-4" />
                Tạo SOP mới
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SectionCard title="Tổng SOP" description="Các quy trình đang có">
            <div className="text-3xl font-semibold text-slate-950">{stats.total}</div>
          </SectionCard>
          <SectionCard title="Trung bình bước" description="Độ dài quy trình trung bình">
            <div className="text-3xl font-semibold text-slate-950">{stats.averageSteps}</div>
          </SectionCard>
          <SectionCard title="Tìm kiếm" description="Lọc nhanh theo tên">
            <Badge variant="outline">Dạng danh sách</Badge>
          </SectionCard>
          <SectionCard title="Trạng thái" description="SOP có thể xem ngay">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Rõ ràng</Badge>
          </SectionCard>
        </div>

        <FilterBar>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm SOP..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.goToFirstPage();
              }}
            />
          </div>
        </FilterBar>

        {isLoading ? (
          <ListPageSkeleton cards={4} rows={6} />
        ) : error ? (
          <ErrorState
            title="Không thể tải workflow"
            description="Vui lòng kiểm tra kết nối hoặc thử lại sau."
            onAction={() => refetch()}
          />
        ) : sops.length === 0 ? (
          <EmptyState
            title={searchQuery ? "Không tìm thấy SOP nào" : "Chưa có SOP nào"}
            description="Hãy tạo SOP mới để bắt đầu chuẩn hóa quy trình vận hành."
            actionLabel="Tạo SOP mới"
            onAction={() => window.location.assign("/manager/workflow/create")}
            icon={<WorkflowIcon className="h-10 w-10" />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sops.map((sop: any) => (
              <SectionCard
                key={sop.id}
                className="cursor-pointer hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]"
                title={sop.name}
                description={sop.description || "Không có mô tả"}
                action={<StatusBadge status={`v${sop.version}`} />}
              >
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Loại dịch vụ</span>
                    <span className="font-medium text-slate-950">{translateServiceType(sop.serviceType)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Loại môi trường</span>
                    <span className="font-medium text-slate-950">{sop.environmentType?.name || "Chưa xác định"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Số bước</span>
                    <span className="font-medium text-slate-950">{sop.stepCount} bước</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(sop)}>
                      Xem chi tiết
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/manager/workflow/${sop.id}`}>Mở SOP</Link>
                    </Button>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}

        {!isLoading && !error && sops.length > 0 ? (
          <PaginationWithInfo
            currentPage={pagination.currentPage}
            totalPages={totalPages || 1}
            pageSize={pagination.pageSize}
            totalElements={totalElements}
            onPageChange={pagination.setPage}
          />
        ) : null}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  SOP version {selected.version} · {translateServiceType(selected.serviceType)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-slate-600">
                <p>{selected.description || "Không có mô tả chi tiết."}</p>
                <div className="grid grid-cols-2 gap-3">
                  <SectionCard title="Môi trường">
                    {selected.environmentType?.name || "Chưa xác định"}
                  </SectionCard>
                  <SectionCard title="Số bước">
                    {selected.stepCount} bước
                  </SectionCard>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                  <Button asChild>
                    <Link href={`/manager/workflow/${selected.id}`}>Mở trang chi tiết</Link>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
