"use client";

import { useState } from "react";
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
  useZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
} from "@/hooks/useZones";

import { StandardDialog } from "@/components/ui/standard-dialog";
import ZoneForm from "./ZoneForm";
import { toast } from "sonner";
import { useAllLocations } from "@/hooks/useLocations";

export default function ZonesPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [locationId, setLocationId] = useState<string>("");
  const { data: locations } = useAllLocations();

  const { data } = useZones({
    pageNumber,
    pageSize: 20,
    locationId: locationId || undefined,
  });

  const totalPages = Math.ceil(
    (data?.totalCount ?? 0) / (data?.pageSize ?? 20)
  );

  const hasNextPage = (data?.pageNumber ?? 1) < totalPages;
  const hasPreviousPage = (data?.pageNumber ?? 1) > 1;

  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: form,
        });

        toast.success("Cập nhật zone thành công");
      } else {
        await createMutation.mutateAsync(form);

        toast.success("Thêm zone thành công");
      }

      setOpen(false);
      setEditing(null);
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa zone này?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa zone thành công");
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
<div className="flex justify-between items-center mb-6">
  
  {/* LEFT */}
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold">
      Quản lý khu vực
    </h1>

    <select
      value={locationId}
      onChange={(e) => {
        setLocationId(e.target.value);
        setPageNumber(1);
      }}
      className="border rounded-md px-3 py-2 text-sm"
    >
      <option value="">Tất cả vị trí</option>

      {locations?.map((l: any) => (
        <option key={l.id} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  </div>

  {/* RIGHT */}
  <Button
    onClick={() => {
      setEditing(null);
      setOpen(true);
    }}
  >
    <Plus className="w-4 h-4 mr-2" />
    Thêm khu vực
  </Button>
</div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Khu vực ({data?.totalCount ?? 0})</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.items?.map((z: any) => (
                  <TableRow key={z.id}>
                    <TableCell>{z.name}</TableCell>
                    <TableCell>{z.description}</TableCell>
                    <TableCell>{z.locationName}</TableCell>

                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(z);
                          setOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(z.id)}
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
        title={editing ? "Cập nhật khu vực" : "Thêm khu vực"}
      >
        <ZoneForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>
    </div>
  );
}