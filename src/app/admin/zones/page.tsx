"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import { Plus, Edit2, Trash2 } from "lucide-react";

import {
  useZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
} from "@/hooks/useZones";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { usePagination } from "@/hooks/usePagination";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import ZoneForm from "./ZoneForm";
import { toast } from "sonner";

export default function ZonesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [locationId, setLocationId] = useState<string>("");
  const {
    currentPage,
    setPage,
    reset,
    paginationParams,
  } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  // reset page when filter changes
  useEffect(() => {
    reset();
  }, [locationId]);

  // ================= DATA =================
  const { data } = useZones({
    pageNumber: paginationParams.pageNumber,
    pageSize: paginationParams.pageSize,
    locationId: locationId || undefined,
  });

  const createMutation = useCreateZone();
  const updateMutation = useUpdateZone();
  const deleteMutation = useDeleteZone();

  const totalPages = Math.ceil(
    (data?.totalCount ?? 0) / (paginationParams.pageSize ?? 10)
  );

  const hasNextPage =
    (data?.pageNumber ?? 1) < totalPages;

  const hasPreviousPage =
    (data?.pageNumber ?? 1) > 1;

  // ================= HANDLERS =================
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Xóa zone thành công");
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Quản lý khu vực
            </h1>

            <SearchableSelect
              value={locationId || ""}
              onValueChange={(value) => setLocationId(value)}
              placeholder="Lọc theo vị trí"
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["locations", "infinite"]}
              queryFn={(page, pageSize, search) =>
                import("@/lib/location-api").then((m) =>
                  m.getLocationsPaginatedNew(page, pageSize, { search }).then(res => ({
                    ...res,
                    content: res.content.map(item => ({
                      ...item,
                      id: item.id || "",
                      name: item.name || ""
                    }))
                  })),
                )
              }
              getItemById={(id) =>
                import("@/lib/location-api").then((m) => 
                  m.getLocationById(id).then(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                )
              }
              className="w-full md:w-[250px]"
            />
          </div>

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
            <CardTitle>
              Danh sách ({data?.totalCount ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">
                    Hành động
                  </TableHead>
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
                        onClick={() => setDeleteTarget(z)}
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
                onClick={() => setPage(currentPage - 1)}
              >
                Trước
              </Button>

              <div className="text-sm text-gray-500">
                Trang {data?.pageNumber} / {totalPages}
              </div>

              <Button
                disabled={!hasNextPage}
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
        title={editing ? "Cập nhật khu vực" : "Thêm khu vực"}
      >
        <ZoneForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>

      <ConfirmDialog 
        open={!!deleteTarget} 
        title="Xóa zone này?" 
        description="Hành động này không thể hoàn tác." 
        confirmLabel="Xóa" 
        onConfirm={handleDelete} 
        onOpenChange={(open) => !open && setDeleteTarget(null)} 
      />
    </div>
  );
}