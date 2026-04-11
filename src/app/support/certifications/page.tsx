"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Award } from "lucide-react";

import {
  useCertifications,
  useDeleteCertification,
  useCreateCertification,
  useUpdateCertification,
} from "@/hooks/useCertifications";

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

  const queryClient = useQueryClient();

  // ================= API =================
  const { data, isLoading } = useCertifications({
    pageNumber,
    pageSize,
  });

  const createMutation = useCreateCertification();
  const updateMutation = useUpdateCertification();
  const deleteMutation = useDeleteCertification();

  // ================= LOAD CATEGORY =================
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

  // ================= FILTER BY CATEGORY =================
  const filtered = useMemo(() => {
    const items = data?.content ?? [];

    if (!category) return items;

    return items.filter(
      (cert: any) => cert.category === category
    );
  }, [data, category]);

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;

    try {
      const result = await deleteMutation.mutateAsync(id);

      if (!result || result <= 0) {
        alert("Xóa thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa.");
    }
  };

  // ================= CREATE / EDIT =================
  const handleOpenCreate = () => {
    setEditing(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditing(item);
    setOpenDialog(true);
  };

  const handleSubmit = async (form: any) => {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: form,
      });
    } else {
      await createMutation.mutateAsync(form);
    }

    setOpenDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
            <Award className="h-6 w-6 text-accent-foreground" />
          </div>

          <div>
            <h1 className="text-4xl font-bold">Quản lý chứng chỉ</h1>
            <p className="text-muted-foreground">
              Quản lý chứng chỉ theo danh mục
            </p>
          </div>
        </div>

        {/* FILTER + BUTTON */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">

          {/* CATEGORY FILTER */}
          <select
            className="border rounded px-3 py-2 w-64"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm chứng chỉ
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách chứng chỉ ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Không có dữ liệu
              </div>
            ) : (
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
                      <TableCell className="font-semibold">
                        {cert.name}
                      </TableCell>

                      <TableCell>
                        <Badge>{cert.category}</Badge>
                      </TableCell>

                      <TableCell>
                        {cert.issuingOrganization}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(cert)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDelete(cert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <div className="text-sm text-gray-500">
                Trang {data?.pageNumber ?? 1} / {data?.totalPages ?? 1}
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={!data?.hasPreviousPage}
                  onClick={() =>
                    setPageNumber((p) => Math.max(1, p - 1))
                  }
                >
                  Trước
                </Button>

                <Button
                  disabled={!data?.hasNextPage}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Tiếp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG */}
      <StandardDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title={editing ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ"}
      >
        <CertificationForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpenDialog(false)}
        />
      </StandardDialog>
    </div>
  );
}