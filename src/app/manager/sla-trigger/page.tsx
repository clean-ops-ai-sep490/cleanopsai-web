"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationWithInfo } from "@/components/ui/pagination";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Plus, Edit, Trash2, Search, Eye, Loader2, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSLAsPaginated } from "@/lib/sla-api";
import { useDeleteSLA } from "@/hooks/useSLAQuery";
import { usePaginatedData } from "@/hooks/usePagination";
import { translateServiceType } from "@/lib/utils/translate";

export default function SLATriggerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const pagination = usePaginatedData({ initialPageSize: 10 });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["slas", pagination.currentPage, pagination.pageSize, searchTerm, serviceTypeFilter],
    queryFn: () => getSLAsPaginated(pagination.currentPage, pagination.pageSize, {
      search: searchTerm || undefined,
      serviceType: serviceTypeFilter !== "all" ? serviceTypeFilter : undefined,
    }),
  });

  const paginatedSLAs = usePaginatedData({ data, initialPageSize: 10 });
  const deleteMutation = useDeleteSLA();
  const slas = paginatedSLAs.items;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Bộ kích hoạt SLA"
          description="Quản lý các luật SLA bằng dạng danh sách rõ ràng, dễ lọc và dễ kiểm tra."
          action={<Button asChild><Link href="/manager/sla-trigger/create"><Plus className="h-4 w-4" />Tạo SLA mới</Link></Button>}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionCard title="Tổng SLA"><div className="text-3xl font-semibold">{paginatedSLAs.totalElements}</div></SectionCard>
          <SectionCard title="Loại dịch vụ"><div className="text-3xl font-semibold">3+</div></SectionCard>
          <SectionCard title="Trạng thái"><div className="text-3xl font-semibold">Rule</div></SectionCard>
        </div>

        <FilterBar>
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Tìm kiếm SLA..." className="pl-10" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); pagination.goToFirstPage(); }} />
            </div>
            <Select value={serviceTypeFilter} onValueChange={(value) => { setServiceTypeFilter(value); pagination.goToFirstPage(); }}>
              <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="Lọc loại dịch vụ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Cleaning">Vệ sinh</SelectItem>
                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                <SelectItem value="Repair">Sửa chữa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()}><Loader2 className="h-4 w-4" />Làm mới</Button>
        </FilterBar>

        {isLoading ? <ListPageSkeleton cards={3} rows={6} /> : paginatedSLAs.isEmpty ? <EmptyState title="Chưa có SLA phù hợp" description="Tạo SLA để quản lý ngưỡng và phản ứng vận hành." actionLabel="Tạo SLA mới" onAction={() => window.location.assign('/manager/sla-trigger/create')} icon={<Zap className="h-10 w-10" />} /> : (
          <SectionCard title="Danh sách SLA" description="Xem nhanh, mở chi tiết hoặc sửa ngay từ danh sách.">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên SLA</TableHead>
                  <TableHead>Loại dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slas.map((sla: any) => (
                  <TableRow key={sla.id}>
                    <TableCell className="font-medium">{sla.name}</TableCell>
                    <TableCell><StatusBadge status={translateServiceType(sla.serviceType)} /></TableCell>
                    <TableCell>{sla.description || "Không có mô tả"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm"><Link href={`/manager/sla-trigger/${sla.id}`}><Eye className="h-4 w-4" /></Link></Button>
                        <Button asChild variant="ghost" size="icon-sm"><Link href={`/manager/sla-trigger/${sla.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(sla)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        )}

        {!isLoading && !paginatedSLAs.isEmpty ? <PaginationWithInfo currentPage={paginatedSLAs.currentPage} totalPages={paginatedSLAs.totalPages || 1} pageSize={paginatedSLAs.pageSize} totalElements={paginatedSLAs.totalElements} onPageChange={paginatedSLAs.setPage} /> : null}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Xóa SLA này?" description="Hành động này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </>
  );
}
