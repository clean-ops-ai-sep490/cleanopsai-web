"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Plus, Edit2, Trash2 } from "lucide-react";

import {
  useSteps,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "@/hooks/useSteps";

import { usePagination } from "@/hooks/usePagination";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import StepForm from "./StepForm";
import { toast } from "sonner";

export default function StepsPage() {
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // ✅ pagination hook
  const {
    currentPage,
    pageSize,
    setPage,
    paginationParams,
    reset,
  } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  // reset page khi search
  useEffect(() => {
    reset();
  }, [keyword]);

  // API
  const { data, isLoading } = useSteps({
    search: keyword || undefined,
    pageNumber: paginationParams.pageNumber,
    pageSize: paginationParams.pageSize
  });

  const createMutation = useCreateStep();
  const updateMutation = useUpdateStep();
  const deleteMutation = useDeleteStep();

  // submit
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
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý các bước</h1>

          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bước
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action Key</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {data?.content?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.actionKey}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>

                        <TableCell className="text-right flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditing(item);
                              setOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination UI */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Trước
                  </Button>

                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>

                  <Button
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật bước" : "Tạo bước mới"}
      >
        <StepForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>

      <ConfirmDialog 
        open={!!deleteTarget} 
        title="Xóa bước này?" 
        description="Bạn có chắc muốn xóa bước này không?" 
        confirmLabel="Xóa" 
        onConfirm={handleDelete} 
        onOpenChange={(open) => !open && setDeleteTarget(null)} 
      />
    </div>
  );
}