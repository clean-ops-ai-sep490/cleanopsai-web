"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import { Plus, Edit2, Trash2, Eye } from "lucide-react";

import {
  useWorkAreas,
  useCreateWorkArea,
  useUpdateWorkArea,
  useDeleteWorkArea,
} from "@/hooks/useWorkAreas";

import { useWorkAreaDetailsByWorkAreaId } from "@/hooks/useWorkAreaDetails";
import { usePagination } from "@/hooks/usePagination";

import { StandardDialog } from "@/components/ui/standard-dialog";
import WorkAreaForm from "./WorkareaForm";
import { toast } from "sonner";

export default function WorkAreasPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [selectedWorkAreaId, setSelectedWorkAreaId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
  const { data } = useWorkAreas({
    pageNumber: paginationParams.pageNumber,
    pageSize: paginationParams.pageSize,
  });

  const createMutation = useCreateWorkArea();
  const updateMutation = useUpdateWorkArea();
  const deleteMutation = useDeleteWorkArea();

  const { data: details, isLoading } =
    useWorkAreaDetailsByWorkAreaId(selectedWorkAreaId ?? undefined, {
      pageNumber: 1,
      pageSize: 10,
    });

  const totalPages = Math.ceil(
    (data?.totalCount ?? 0) / (paginationParams?.pageSize ?? 10)
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
    if (!confirm("Xóa khu vực làm việc?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa thành công");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedWorkAreaId(id);
    setDetailOpen(true);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Khu Vực Làm Việc
          </h1>

          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm khu vực làm việc
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách ({data?.totalCount ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead className="text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.items?.map((w: any) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.zoneName}</TableCell>

                    <TableCell className="text-right flex justify-end gap-2">

                      <Button
                        variant="ghost"
                        onClick={() => handleViewDetail(w.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(w);
                          setOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(w.id)}
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
        title={editing ? "Cập nhật khu vực làm việc" : "Thêm khu vực làm việc"}
      >
        <WorkAreaForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>

      {/* DETAIL DIALOG */}
      <StandardDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Chi tiết khu vực làm việc"
      >
        {isLoading ? (
          <p>Đang tải...</p>
        ) : details?.items?.length ? (
          <div className="space-y-3">
            {details.items.map((d: any) => (
              <div key={d.id} className="border-b pb-2">
                <p><b>Tên:</b> {d.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </StandardDialog>

    </div>
  );
}