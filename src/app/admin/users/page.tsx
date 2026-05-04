"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Unlock, Search, Users, Shield, ListFilter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import UserForm from "./UserForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const { getUsers, register, updateUser, deleteUser, unlockUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<any | null>(null);

  const { currentPage, setPage, reset, paginationParams } = usePagination({ initialPage: 1, initialPageSize: 10 });

  useEffect(() => { reset(); }, [keyword, role, reset]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers({ keyword, role, pageNumber: paginationParams.pageNumber, pageSize: paginationParams.pageSize });
      setData(res);
    } catch {
      setError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [keyword, role, currentPage]);

  const roles = useMemo(() => ["", "Admin", "Manager", "Supporter", "Supervisor", "Worker"], []);

  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await updateUser(editing.id, { fullName: form.fullName, role: form.role });
        toast.success("Cập nhật user thành công");
      } else {
        await register(form);
        toast.success("Tạo user thành công");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      toast.success("Xóa user thành công");
    } catch {
      toast.error("Không thể xóa user");
    } finally {
      setDeleteTarget(null);
      load();
    }
  };

  const handleUnlock = async () => {
    if (!unlockTarget) return;
    try {
      await unlockUser(unlockTarget.id);
      toast.success("Mở khóa user thành công");
    } catch {
      toast.error("Không thể mở khóa user");
    } finally {
      setUnlockTarget(null);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý người dùng" description="Danh sách user, role và trạng thái đăng nhập." action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Thêm user</Button>} />

      <SectionCard>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng user</p>
              <p className="text-2xl font-semibold text-slate-950">{data?.totalElements ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Trang hiện tại</p>
              <p className="text-2xl font-semibold text-slate-950">{currentPage}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ListFilter className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Lọc theo Role</p>
              <p className="text-2xl font-semibold text-slate-950">{role || "Tất cả"}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <FilterBar>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Tìm user..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="pl-10" />
        </div>
        <select className={cn("h-10 rounded-[var(--radius-md)] border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm", "focus:border-[var(--app-primary)] focus:outline-none")} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tất cả role</option>
          {roles.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </FilterBar>

      {loading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải user" description={error} onAction={load} />
      ) : !data?.content?.length ? (
        <EmptyState title="Chưa có user nào" description="Tạo user đầu tiên để bắt đầu quản lý truy cập." actionLabel="Thêm user" onAction={() => setOpen(true)} />
      ) : (
        <SectionCard title={`Users (${data?.totalElements ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="max-w-[260px] truncate">{u.email}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{u.fullName}</TableCell>
                  <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(u); setOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                      {u.status === "Locked" ? <Button variant="ghost" size="icon-sm" onClick={() => setUnlockTarget(u)}><Unlock className="h-4 w-4" /></Button> : null}
                      <Button variant="ghost" size="icon-sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(u)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Trước</Button>
            <span>Trang {currentPage} / {data?.totalPages ?? 1}</span>
            <Button variant="outline" disabled={currentPage >= (data?.totalPages ?? 1)} onClick={() => setPage(currentPage + 1)}>Sau</Button>
          </div>
        </SectionCard>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Cập nhật người dùng" : "Thêm người dùng"}</DialogTitle></DialogHeader>
          <UserForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa user này?" description="Hành động này không thể hoàn tác." confirmLabel="Xóa" onConfirm={handleDelete} onOpenChange={(open) => !open && setDeleteTarget(null)} />
      <ConfirmDialog open={!!unlockTarget} title="Mở khóa user?" description="Người dùng sẽ có thể đăng nhập lại." confirmLabel="Mở khóa" onConfirm={handleUnlock} onOpenChange={(open) => !open && setUnlockTarget(null)} />
    </div>
  );
}
