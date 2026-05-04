"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from "@/hooks/useLocations";
import { usePagination } from "@/hooks/usePagination";
import { StandardDialog } from "@/components/ui/standard-dialog";
import LocationForm from "./LocationForm";
import { toast } from "sonner";

export default function LocationsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const pagination = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { data, isLoading, error, refetch } = useLocations({ ...pagination.paginationParams });

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const totalPages = Math.ceil((data?.totalCount ?? 0) / (pagination.pageSize || 10));

  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
        toast.success("Cập nhật vị trí thành công");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Thêm vị trí thành công");
      }
      setOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý vị trí" description="Danh sách vị trí theo pattern bảng chuẩn." action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Thêm vị trí</Button>} />

      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải vị trí" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : !data?.items?.length ? (
        <EmptyState title="Chưa có vị trí" description="Vị trí sẽ xuất hiện ở đây khi có dữ liệu." icon={<MapPin className="h-10 w-10" />} actionLabel="Thêm vị trí" onAction={() => setOpen(true)} />
      ) : (
        <SectionCard title={`Vị trí (${data?.totalCount ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tỉnh (TP)</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell className="max-w-[260px] truncate">{l.address}</TableCell>
                  <TableCell>{l.province}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{l.clientName}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon-sm" onClick={() => { setEditing(l); setOpen(true); }}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(l)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <Button variant="outline" disabled={pagination.currentPage === 1} onClick={pagination.prevPage}>Trước</Button>
            <span>Trang {pagination.currentPage} / {totalPages || 1}</span>
            <Button variant="outline" disabled={pagination.currentPage >= totalPages} onClick={pagination.nextPage}>Sau</Button>
          </div>
        </SectionCard>
      )}

      <StandardDialog open={open} onOpenChange={setOpen} title={editing ? "Cập nhật vị trí" : "Thêm vị trí"}>
        <LocationForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </StandardDialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa vị trí này?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}
