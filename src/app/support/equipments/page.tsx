"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Package } from "lucide-react";

import {
  useSearchEquipments,
  useDeleteEquipment,
  useCreateEquipment,
  useUpdateEquipment,
} from "@/hooks/useEquipments";

import { StandardDialog } from "@/components/ui/standard-dialog";
import EquipmentForm from "./EquipmentForm";

export default function SupportEquipmentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();

  // ================= DEBOUNCE SEARCH =================
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPageNumber(1);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  // ================= API SEARCH =================
  const { data, isLoading } = useSearchEquipments(
    debouncedSearch,
    pageNumber,
    pageSize
  );

  // ================= TYPES FILTER =================
  const types = useMemo(() => {
    const items = data?.content ?? [];
    const set = new Set<string>();
    items.forEach((it: any) => set.add(it.type ?? "Unknown"));
    return ["all", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const items = data?.content ?? [];
    if (typeFilter !== "all") {
      return items.filter((i: any) => i.type === typeFilter);
    }
    return items;
  }, [data, typeFilter]);

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa thiết bị này?")) return;

    try {
      const result = await deleteMutation.mutateAsync(id);
      if (!result || result <= 0) {
        alert("Xóa không thành công.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa.");
    }
  };

  // ================= CRUD =================
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
            <Package className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Quản lý thiết bị</h1>
            <p className="text-muted-foreground">
              Tìm kiếm và quản lý thiết bị
            </p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">

          {/* SEARCH (API) */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <Input
              placeholder="Tìm kiếm thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* TYPE FILTER */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "Tất cả loại" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm thiết bị
          </Button>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách thiết bị ({data?.totalElements ?? 0})
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
                    <TableHead>Loại</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((eq: any) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-semibold">
                        {eq.name}
                      </TableCell>

                      <TableCell>
                        <Badge>{eq.type}</Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {eq.description}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleOpenEdit(eq)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDelete(eq.id)}
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
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>

                <Button
                  disabled={!data?.hasNextPage}
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  Sau
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
        title={editing ? "Cập nhật thiết bị" : "Thêm thiết bị"}
      >
        <EquipmentForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpenDialog(false)}
        />
      </StandardDialog>
    </div>
  );
}