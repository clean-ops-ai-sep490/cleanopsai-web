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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Plus, Edit2, Trash2, Loader2, Award } from "lucide-react";
import { useCertifications, useDeleteCertification, useCreateCertification, useUpdateCertification } from "@/hooks/useCertifications";
import { getCertificationCategories } from "@/lib/certification-api";
import { StandardDialog } from "@/components/ui/standard-dialog";
import CertificationForm from "./CertificationForm";

export default function CertificationsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useCertifications({ pageNumber, pageSize });
  const createMutation = useCreateCertification();
  const updateMutation = useUpdateCertification();
  const deleteMutation = useDeleteCertification();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getCertificationCategories();
        setCategories(res || []);
      } catch (err) {
        console.error("Load categories failed:", err);
      }
    };
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const items = data?.content ?? [];
    if (!category) return items;
    return items.filter((cert: any) => cert.category === category);
  }, [data, category]);

  const handleSubmit = async (form: any) => {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data: form });
    else await createMutation.mutateAsync(form);
    setOpenDialog(false);
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["certifications"] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ["certifications"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý chứng chỉ" description="Quản lý chứng chỉ theo danh mục với pattern thống nhất." action={<Button onClick={() => { setEditing(null); setOpenDialog(true); }}><Plus className="h-4 w-4" />Thêm chứng chỉ</Button>} />

      <FilterBar>
        <Select value={category} onValueChange={(value) => { setCategory(value); setPageNumber(1); }}>
          <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Tất cả danh mục" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả danh mục</SelectItem>
            {categories.map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải chứng chỉ" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có chứng chỉ" description="Chứng chỉ sẽ hiển thị tại đây khi có dữ liệu." icon={<Award className="h-10 w-10" />} actionLabel="Thêm chứng chỉ" onAction={() => { setEditing(null); setOpenDialog(true); }} />
      ) : (
        <SectionCard title={`Danh sách chứng chỉ (${data?.totalElements ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Tổ chức</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cert: any) => (
                <TableRow key={cert.id}>
                  <TableCell className="max-w-[280px] truncate font-semibold text-slate-950">{cert.name}</TableCell>
                  <TableCell><StatusBadge status={cert.category || "Unknown"} /></TableCell>
                  <TableCell className="max-w-[320px] truncate">{cert.issuingOrganization || "-"}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={() => { setEditing(cert); setOpenDialog(true); }}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(cert)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Trang {data?.pageNumber ?? 1} / {data?.totalPages ?? 1}</span>
            <div className="flex gap-2"><Button variant="outline" disabled={!data?.hasPreviousPage} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>Trước</Button><Button variant="outline" disabled={!data?.hasNextPage} onClick={() => setPageNumber((p) => p + 1)}>Tiếp</Button></div>
          </div>
        </SectionCard>
      )}

      <StandardDialog open={openDialog} onOpenChange={setOpenDialog} title={editing ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ"}>
        <CertificationForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpenDialog(false)} />

      </StandardDialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa chứng chỉ này?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}
