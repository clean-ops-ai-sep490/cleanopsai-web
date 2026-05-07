"use client";

import { useMemo, useState } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Plus, Edit2, Trash2, Search, Star } from "lucide-react";
import { useSearchSkills, useCreateSkill, useUpdateSkill, useDeleteSkill, useSkillsByCategory, useSkillCategories } from "@/hooks/useSkills";
import { StandardDialog } from "@/components/ui/standard-dialog";
import SkillForm from "./SkillForm";

export default function SkillsPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const queryClient = useQueryClient();
  const isFilterByCategory = category !== "all";
  const searchResult = useSearchSkills(keyword, pageNumber, pageSize);
  const categoryResult = useSkillsByCategory(category);
  const { data: categories } = useSkillCategories();

  const data = isFilterByCategory ? categoryResult.data : searchResult.data;
  const isLoading = isFilterByCategory ? categoryResult.isLoading : searchResult.isLoading;
  const error = isFilterByCategory ? categoryResult.error : searchResult.error;
  const refetch = isFilterByCategory ? categoryResult.refetch : searchResult.refetch;

  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.content;
  }, [data]);
  const totalItems = Array.isArray(data)
    ? data.length
    : (data?.totalElements ?? 0);

  const handleSubmit = async (form: any) => {
    if (editing) await updateMutation.mutateAsync({ id: editing.id, data: form });
    else await createMutation.mutateAsync(form);
    setOpen(false);
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["skills"] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ["skills"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý kỹ năng" description="Quản lý kỹ năng chuyên môn theo list view gọn và rõ." action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Thêm kỹ năng</Button>} />

      <FilterBar>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Tìm kiếm kỹ năng..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setCategory("all"); setPageNumber(1); }} className="pl-10" disabled={isFilterByCategory} />
        </div>
        <Select value={category} onValueChange={(value) => { setCategory(value); setKeyword(""); setPageNumber(1); }}>
          <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Danh mục" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories?.map((c: any) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải kỹ năng" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có kỹ năng" description="Kỹ năng sẽ hiển thị tại đây sau khi được tạo." icon={<Star className="h-10 w-10" />} actionLabel="Thêm kỹ năng" onAction={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <SectionCard title={`Danh sách kỹ năng (${totalItems})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[260px] truncate font-semibold text-slate-950">{item.name}</TableCell>
                  <TableCell><StatusBadge status={item.category || "Unknown"} /></TableCell>
                  <TableCell className="max-w-[320px] truncate text-slate-500">{item.description || "-"}</TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={() => { setEditing(item); setOpen(true); }}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(item)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isFilterByCategory && !Array.isArray(data) ? <div className="mt-4 flex items-center justify-between text-sm text-slate-500"><span>Trang {data?.pageNumber} / {data?.totalPages}</span><div className="flex gap-2"><Button variant="outline" disabled={!data?.hasPreviousPage} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>Trước</Button><Button variant="outline" disabled={!data?.hasNextPage} onClick={() => setPageNumber((p) => p + 1)}>Sau</Button></div></div> : null}
        </SectionCard>
      )}
      <StandardDialog open={open} onOpenChange={setOpen} title={editing ? "Cập nhật kỹ năng" : "Thêm kỹ năng"}>
        <SkillForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </StandardDialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa kỹ năng này?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
    </div>
  );
}
