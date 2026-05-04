"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Plus, Edit2, Trash2, Search, Package, Loader2 } from "lucide-react";
import { useSearchEquipments, useDeleteEquipment, useCreateEquipment, useUpdateEquipment } from "@/hooks/useEquipments";
import { StandardDialog } from "@/components/ui/standard-dialog";
import EquipmentForm from "./EquipmentForm";

export default function SupportEquipmentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNumber(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error, refetch } = useSearchEquipments(debouncedSearch, pageNumber, pageSize);

  const items = useMemo(() => data?.content ?? [], [data]);
  const types = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it: any) => set.add(it.type ?? "Unknown"));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return items;
    return items.filter((i: any) => i.type === typeFilter);
  }, [items, typeFilter]);

  const handleSubmit = async (form: any) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setOpenDialog(false);
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["equipments"] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ["equipments"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thiết bị"
        description="Tìm kiếm, lọc và quản lý thiết bị trong cùng một màn hình gọn, rõ."
        action={<Button onClick={() => { setEditing(null); setOpenDialog(true); }}><Plus className="h-4 w-4" />Thêm thiết bị</Button>}
      />

      <FilterBar>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Tìm kiếm thiết bị..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Loại" /></SelectTrigger>
          <SelectContent>
            {types.map((t) => <SelectItem key={t} value={t}>{t === "all" ? "Tất cả loại" : t}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <SectionCard><div className="py-12 text-center text-slate-500"><Loader2 className="mr-2 inline h-5 w-5 animate-spin" />Đang tải...</div></SectionCard>
      ) : error ? (
        <ErrorState title="Không thể tải thiết bị" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có thiết bị" description="Thiết bị sẽ hiển thị tại đây sau khi được tạo." icon={<Package className="h-10 w-10" />} actionLabel="Thêm thiết bị" onAction={() => { setEditing(null); setOpenDialog(true); }} />
      ) : (
        <SectionCard title={`Danh sách thiết bị (${data?.totalElements ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((eq: any) => (
                <TableRow key={eq.id}>
                  <TableCell className="max-w-[280px] truncate font-semibold text-slate-950">{eq.name}</TableCell>
                  <TableCell><StatusBadge status={eq.type || "Unknown"} /></TableCell>
                  <TableCell className="max-w-[320px] truncate text-slate-500">{eq.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(eq); setOpenDialog(true); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(eq)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Trang {data?.pageNumber ?? 1} / {data?.totalPages ?? 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!data?.hasPreviousPage} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>Trước</Button>
              <Button variant="outline" disabled={!data?.hasNextPage} onClick={() => setPageNumber((p) => p + 1)}>Sau</Button>
            </div>
          </div>
        </SectionCard>
      )}

      <StandardDialog open={openDialog} onOpenChange={setOpenDialog} title={editing ? "Cập nhật thiết bị" : "Thêm thiết bị"}>
        <EquipmentForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpenDialog(false)} />
      </StandardDialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa thiết bị này?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}
