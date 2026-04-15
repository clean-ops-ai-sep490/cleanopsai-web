"use client";

import { useState } from "react";
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

import { Plus, Edit2, Trash2 } from "lucide-react";

import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/hooks/useLocations";

import { StandardDialog } from "@/components/ui/standard-dialog";
import LocationForm from "./LocationForm";
import { toast } from "sonner";

export default function LocationsPage() {
  const [keyword, setKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  

  const { data, isLoading } = useLocations({
    pageNumber,
    pageSize: 10,
  });
  const totalPages = Math.ceil(
  (data?.totalCount ?? 0) / (data?.pageSize ?? 10)
);

const hasNextPage = (data?.pageNumber ?? 1) < totalPages;
const hasPreviousPage = (data?.pageNumber ?? 1) > 1;

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleSubmit = async (form: any) => {
  try {
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: form,
      });

      toast.success("Cập nhật vị trí thành công");
    } else {
      await createMutation.mutateAsync(form);

      toast.success("Thêm vị trí thành công");
    }

    setOpen(false);
    setEditing(null);
  } catch (err) {
    toast.error("Có lỗi xảy ra, vui lòng thử lại");
  }
};

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa location này?")) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex gap-3 mb-6 justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Quản lý vị trí</h1>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm vị trí
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Vị trí ({data?.totalCount ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Tỉnh (TP)</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.items?.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.address}</TableCell>
                    <TableCell>{l.province}</TableCell>
                    <TableCell>{l.clientName}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(l);
                          setOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(l.id)}
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
                disabled={!hasPreviousPage}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                Trước
              </Button>

              <div className="text-sm text-gray-500">
                Trang {data?.pageNumber} / {totalPages}
              </div>

              <Button
                disabled={!hasNextPage}
                onClick={() => setPageNumber((p) => p + 1)}
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
        title={editing ? "Cập nhật vị trí" : "Thêm vị trí"}
      >
        <LocationForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}