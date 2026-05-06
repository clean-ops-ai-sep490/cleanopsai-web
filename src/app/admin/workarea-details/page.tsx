"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";

import {
  useWorkAreaDetails,
  useCreateWorkAreaDetail,
  useUpdateWorkAreaDetail,
  useDeleteWorkAreaDetail,
} from "@/hooks/useWorkAreaDetails";

import { usePagination } from "@/hooks/usePagination";
import { StandardDialog } from "@/components/ui/standard-dialog";
import WorkAreaDetailForm from "./WorkareaDetailForm";
import { toast } from "sonner";

export default function WorkAreaDetailsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  // ================= PAGINATION =================
  const {
    currentPage,
    setPage,
    paginationParams,
  } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  // ================= DATA =================
  const { data } = useWorkAreaDetails({
    pageNumber: paginationParams.pageNumber,
    pageSize: paginationParams.pageSize,
  });

  const createMutation = useCreateWorkAreaDetail();
  const updateMutation = useUpdateWorkAreaDetail();
  const deleteMutation = useDeleteWorkAreaDetail();

  const totalPages = Math.ceil(
    (data?.totalElements ?? 0) / (paginationParams?.pageSize ?? 10)
  );

  // ================= HANDLERS =================
  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: form,
        });
        toast.success("Cập nhật thành công");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Thêm mới thành công");
      }

      setOpen(false);
      setEditing(null);
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chi tiết khu vực làm việc?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa thành công");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleEditClick = (d: any) => {
  console.log("editing item:", d);
  setEditing(d);
  setOpen(true);
};

  // ================= UI =================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Chi Tiết Khu Vực Làm Việc
          </h1>

          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm khu vực chi tiết
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Khu vực làm việc</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.content?.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.workAreaName}</TableCell>

                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleEditClick(d)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(d.id)}
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
                Trang {currentPage} / {totalPages}
              </div>

              <Button
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FORM DIALOG */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật khu vực chi tiết" : "Thêm khu vực chi tiết"}
      >
        <WorkAreaDetailForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}