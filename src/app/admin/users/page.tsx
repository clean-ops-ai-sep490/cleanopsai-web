"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Unlock, ListFilter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { DataTable } from "@/components/ui/data-table";
import UserForm from "./UserForm";
import { toast } from "sonner";

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
      setError("Không thể tải danh sách người dùng");
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
        toast.success("Cập nhật người dùng thành công");
      } else {
        await register(form);
        toast.success("Tạo người dùng thành công");
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
      toast.success("Xóa người dùng thành công");
    } catch {
      toast.error("Không thể xóa người dùng");
    } finally {
      setDeleteTarget(null);
      load();
    }
  };

  const handleUnlock = async () => {
    if (!unlockTarget) return;
    try {
      await unlockUser(unlockTarget.id);
      toast.success("Mở khóa người dùng thành công");
    } catch {
      toast.error("Không thể mở khóa người dùng");
    } finally {
      setUnlockTarget(null);
      load();
    }
  };

  const columns = [
    {
      header: "Email",
      className: "pl-6 font-medium text-slate-600",
      accessorKey: "email"
    },
    {
      header: "Họ tên",
      className: "font-bold text-slate-900",
      accessorKey: "fullName"
    },
    {
      header: "Vai trò",
      cell: (u: any) => (
        <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
          {u.role}
        </Badge>
      )
    },
    {
      header: "Thao tác",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (u: any) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
            onClick={(e) => { e.stopPropagation(); setEditing(u); setOpen(true); }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {u.status === "Locked" && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-amber-500 hover:bg-amber-50 rounded-lg"
              onClick={(e) => { e.stopPropagation(); setUnlockTarget(u); }}
            >
              <Unlock className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" 
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Quản lý người dùng" 
        description="Quản lý tài khoản, phân quyền và trạng thái hệ thống." 
        action={
          <Button 
            onClick={() => { setEditing(null); setOpen(true); }}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm người dùng
          </Button>
        } 
      />

      {/* Stats Summary - Minimalist Row */}
      <div className="flex items-center gap-12 py-6 border-y border-slate-100 px-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng người dùng</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data?.totalElements ?? 0}</p>
        </div>
        <div className="h-10 w-px bg-slate-100" />
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vai trò hiện tại</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{role || "Tất cả"}</p>
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading && !data ? (
          <ListPageSkeleton rows={8} />
        ) : error ? (
          <ErrorState title="Không thể tải dữ liệu" description={error} onAction={load} />
        ) : (
          <DataTable
            columns={columns}
            data={data?.content || []}
            isLoading={loading}
            emptyMessage="Không tìm thấy người dùng nào"
            search={{
              value: keyword,
              onChange: setKeyword,
              placeholder: "Tìm theo email hoặc họ tên..."
            }}
            filters={
              <select 
                className="h-11 rounded-xl border border-slate-200/60 bg-white px-4 text-xs font-bold text-slate-400 shadow-none outline-none focus:border-slate-300 min-w-[160px] uppercase tracking-wider"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Tất cả vai trò</option>
                {roles.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            }
            pagination={{
              currentPage,
              totalPages: data?.totalPages ?? 1,
              pageSize: paginationParams.pageSize || 10,
              totalElements: data?.totalElements ?? 0,
              onPageChange: setPage
            }}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editing ? "Cập nhật người dùng" : "Thêm người dùng"}</DialogTitle>
          </DialogHeader>
          <UserForm initialData={editing} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteTarget} 
        title="Xóa người dùng này?" 
        description="Hành động này không thể hoàn tác. Người dùng sẽ mất toàn bộ quyền truy cập." 
        confirmLabel="Xóa vĩnh viễn" 
        onConfirm={handleDelete} 
        onOpenChange={(open) => !open && setDeleteTarget(null)} 
      />
      <ConfirmDialog 
        open={!!unlockTarget} 
        title="Mở khóa tài khoản?" 
        description="Người dùng sẽ có thể đăng nhập lại vào hệ thống." 
        confirmLabel="Mở khóa" 
        onConfirm={handleUnlock} 
        onOpenChange={(open) => !open && setUnlockTarget(null)} 
      />
    </div>
  );
}
