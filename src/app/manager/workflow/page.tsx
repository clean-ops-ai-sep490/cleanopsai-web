"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useLoading } from "@/contexts/LoadingContext";

export default function WorkflowListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const { startLoading } = useLoading();

  const pagination = usePagination({ initialPageSize: 9 });
  // ... rest of state
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
      <div className="space-y-8 pb-10">
        <PageHeader
          title="Thiết lập quy trình"
          description="Quản lý các quy trình SOP theo hướng rõ ràng, dễ xem và dễ mở chi tiết."
          action={
            <Button 
              onClick={() => startLoading("Đang chuẩn bị trình tạo SOP...")}
              asChild 
              className="rounded-xl"
            >
              <Link href="/manager/workflow/create">
                <Plus className="h-4 w-4 mr-2" />
                Tạo SOP mới
              </Link>
            </Button>
          }
        />



        {/* Minimalist Search Bar - No outer card wrapper */}
        <div className="flex items-center gap-3 px-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm SOP..."
              className="pl-10 h-11 bg-white border-slate-200/60 rounded-xl shadow-none focus:border-slate-300 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.goToFirstPage();
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <ListPageSkeleton cards={3} rows={6} />
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sops.map((sop: any) => (
              <SectionCard
                key={sop.id}
                className="group border border-slate-100 bg-white hover:border-slate-200 transition-all duration-300"
                title={sop.name}
                description={sop.description || "Không có mô tả"}
                action={<StatusBadge status={`v${sop.version}`} />}
              >
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Loại dịch vụ</span>
                    <span className="font-bold text-slate-700">{translateServiceType(sop.serviceType)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Môi trường</span>
                    <span className="font-bold text-slate-700 truncate max-w-[150px]">{sop.environmentType?.name || "Chưa xác định"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Số lượng</span>
                    <span className="font-bold text-slate-700">{sop.stepCount} bước</span>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary" onClick={() => setSelected(sop)}>
                      Chi tiết
                    </Button>
                    <Button 
                      asChild 
                      size="sm" 
                      className="flex-1 rounded-lg"
                      onClick={() => startLoading("Đang tải chi tiết SOP...")}
                    >
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
        <DialogContent className="rounded-2xl max-w-md">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">{selected.name}</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400">
                  SOP version {selected.version} · {translateServiceType(selected.serviceType)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <p className="text-sm text-slate-500 leading-relaxed">{selected.description || "Không có mô tả chi tiết."}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Môi trường</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{selected.environmentType?.name || "Chưa xác định"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số bước</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{selected.stepCount} bước</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" className="text-slate-400 hover:text-slate-900" onClick={() => setSelected(null)}>Đóng</Button>
                  <Button 
                    asChild 
                    className="rounded-xl px-6"
                    onClick={() => startLoading("Đang tải chi tiết SOP...")}
                  >
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
