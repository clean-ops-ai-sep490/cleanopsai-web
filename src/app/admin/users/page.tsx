"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Plus, Edit2, Trash2, Unlock } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";

import { StandardDialog } from "@/components/ui/standard-dialog";
import UserForm from "./UserForm";
import { toast } from "sonner";

export default function UsersPage() {
  const {
    getUsers,
    register,
    updateUser,
    deleteUser,
    unlockUser,
  } = useAuth();

  const [data, setData] = useState<any>(null);

  // filters
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  // ================= PAGINATION =================
  const {
    currentPage,
    pageSize,
    setPage,
    reset,
    paginationParams,
  } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  // reset page when filters change
  useEffect(() => {
    reset();
  }, [keyword, role]);

  // ================= LOAD DATA =================
  const load = async () => {
    const res = await getUsers({
      keyword,
      role,
      pageNumber: paginationParams.pageNumber,
      pageSize: paginationParams.pageSize,
    });

    setData(res);
  };

  useEffect(() => {
    load();
  }, [keyword, role, currentPage]);

  // ================= HANDLERS =================
  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await updateUser(editing.id, {
          fullName: form.fullName,
          role: form.role,
        });

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

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa user này?")) return;
    await deleteUser(id);
    load();
  };

  const handleUnlock = async (id: string) => {
    await unlockUser(id);
    load();
  };

  // ================= UI =================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Quản lý người dùng
        </h1>

        {/* HEADER */}
        <div className="flex gap-3 mb-6 items-center">
          <Input
            placeholder="Tìm user..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Tất cả role</option>
            <option value="Admin">Admin</option>
            <option value="Supporter">Supporter</option>
            <option value="Worker">Worker</option>
            <option value="Supervisor">Supervisor</option>
          </select>

          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm user
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.content?.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.role}</TableCell>

                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(u);
                          setOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      {u.status === "Locked" && (
                        <Button onClick={() => handleUnlock(u.id)}>
                          <Unlock className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <Button
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Trước
              </Button>

              <div className="text-sm text-gray-500">
                Trang {currentPage} / {data?.totalPages ?? 1}
              </div>

              <Button
                disabled={currentPage >= (data?.totalPages ?? 1)}
                onClick={() => setPage(currentPage + 1)}
              >
                Sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật người dùng" : "Thêm người dùng"}
      >
        <UserForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}