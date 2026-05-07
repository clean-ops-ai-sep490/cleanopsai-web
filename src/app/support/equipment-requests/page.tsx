"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Search, ClipboardList, Check, X, Loader2 } from "lucide-react";
import { useEquipmentRequest, useEquipmentRequests, useEquipmentRequestsByStatus, useReviewEquipmentRequest } from "@/hooks/useEquipmentRequest";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { usePagination } from "@/hooks/usePagination";
import { useTaskAssignment } from "@/hooks/useTaskAssignments";

export default function SupportEquipmentRequestsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"Approved" | "Rejected" | null>(null);

  const reviewMutation = useReviewEquipmentRequest();
  const pagination = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { data: detail, isLoading: loadingDetail } =
  useEquipmentRequest(openDialog ? selected?.id : undefined);
  const { data: taskDetail, isLoading: loadingTask } =
  useTaskAssignment(detail?.taskAssignmentId || "");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      pagination.setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const isAll = statusFilter === "All";
  const allQuery = useEquipmentRequests({ pageNumber: pagination.currentPage, pageSize: pagination.pageSize });
  const statusQuery = useEquipmentRequestsByStatus(isAll ? undefined : statusFilter, { pageNumber: pagination.currentPage, pageSize: pagination.pageSize });
  const activeQuery = isAll ? allQuery : statusQuery;

  const data = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const refetch = activeQuery.refetch;
  const items = useMemo(() => data?.items || [], [data]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((x: any) => x.workerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || x.reason?.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [items, debouncedSearch]);

  const handleReview = async () => {
    if (!selected || !confirmAction) return;
    await reviewMutation.mutateAsync({ id: selected.id, data: { status: confirmAction } });
    setOpenDialog(false);
    setSelected(null);
    setConfirmAction(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yêu cầu thiết bị" description="Review yêu cầu thiết bị từ worker theo danh sách rõ và nhanh." />

      <FilterBar>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Tìm theo worker / lý do..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as any); pagination.setPage(1); }}>
          <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả</SelectItem>
            <SelectItem value="Pending">Chờ xử lý</SelectItem>
            <SelectItem value="Approved">Đã duyệt</SelectItem>
            <SelectItem value="Rejected">Bị từ chối</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Không có yêu cầu" description="Danh sách request sẽ hiển thị tại đây khi có dữ liệu." icon={<ClipboardList className="h-10 w-10" />} />
      ) : (
        <SectionCard title={`Danh sách request (${data?.totalCount ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="max-w-[220px] truncate font-medium">{req.workerName}</TableCell>
                  <TableCell className="max-w-[320px] truncate">{req.reason || "-"}</TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                  <TableCell className="text-slate-500">{new Date(req.created).toLocaleString()}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => { setSelected(req); setOpenDialog(true); }}>Xem</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Trang {pagination.currentPage} / {Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)}</span>
            <div className="flex gap-2"><Button variant="outline" disabled={pagination.currentPage === 1} onClick={pagination.prevPage}>Trước</Button><Button variant="outline" disabled={pagination.currentPage >= Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)} onClick={pagination.nextPage}>Sau</Button></div>
          </div>
        </SectionCard>
      )}

      <StandardDialog open={openDialog} onOpenChange={setOpenDialog} title="Đánh giá yêu cầu">
        {selected && (
          <div className="space-y-4">
            <div><p className="text-sm text-slate-500">Worker</p><p>{selected.workerName}</p></div>
            <div>
  <p className="text-sm text-slate-500">Công việc</p>
  <p>
    {loadingDetail ? "Loading..." : detail?.taskName || "-"}
  </p>
</div>
<div>
  <p className="text-sm text-slate-500">Thiết bị yêu cầu</p>

  {loadingDetail ? (
    <p>Loading...</p>
  ) : detail?.items?.length ? (
    detail.items.map((item, i) => (
      <div key={i} className="flex justify-between border-b py-1">
        <span>{item.equipmentName}</span>
        <span>x{item.quantity}</span>
      </div>
    ))
  ) : (
    <p>-</p>
  )}
</div>
<div>
  <p className="text-sm text-slate-500">Vị trí</p>
  {loadingTask ? (
    <p>Loading...</p>
  ) : (
    <p>{taskDetail?.displayLocation || "-"}</p>
  )}
</div>
            <div><p className="text-sm text-slate-500">Lý do</p><p>{selected.reason || "-"}</p></div>
            <div><p className="text-sm text-slate-500">Trạng thái</p><Badge variant="outline"><StatusBadge status={selected.status} /></Badge></div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="destructive" onClick={() => setConfirmAction("Rejected")}><X className="mr-1 h-4 w-4" />Từ chối</Button>
              <Button onClick={() => setConfirmAction("Approved")}><Check className="mr-1 h-4 w-4" />Đồng ý</Button>
            </div>
          </div>
        )}
      </StandardDialog>

      <ConfirmDialog open={!!confirmAction} title={confirmAction === "Approved" ? "Duyệt yêu cầu?" : "Từ chối yêu cầu?"} description="Hành động này sẽ cập nhật trạng thái yêu cầu." confirmLabel="Xác nhận" onConfirm={handleReview} onOpenChange={(open) => !open && setConfirmAction(null)} />
    </div>
  );
}
