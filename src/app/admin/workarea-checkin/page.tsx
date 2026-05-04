"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

import { Plus, Edit2, Trash2, QrCode, Download } from "lucide-react";

import { StandardDialog } from "@/components/ui/standard-dialog";
import WorkareaCheckinPointForm from "./WorkareaCheckinForm";

import { useWorkareaCheckin } from "@/hooks/useWorkareaCheckin";
import { useWorkArea } from "@/hooks/useWorkarea";
import { usePagination } from "@/hooks/usePagination";

import { toast } from "sonner";

export default function WorkareaCheckinPointsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // QR modal
  const [qrModal, setQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrWorkareaId, setQrWorkareaId] = useState<string>("");

  const qrUrlRef = useRef<string | null>(null);

  const { items, loading, fetchAll, create, update, remove, getQrUrl } =
    useWorkareaCheckin();

  const { items: workareas, fetchAllWorkAreas } = useWorkArea();

  // ================= PAGINATION =================
  const { currentPage, pageSize, setPage, paginationParams } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  // load data
  useEffect(() => {
    fetchAll();
    fetchAllWorkAreas();
  }, [currentPage, fetchAll, fetchAllWorkAreas]);

  // cleanup QR blob
  useEffect(() => {
    if (!qrModal && qrUrlRef.current) {
      window.URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
      setQrUrl(null);
    }
  }, [qrModal]);

  // ================= HANDLERS =================
  const handleSubmit = async (form: any) => {
    try {
      if (editing) {
        await update(editing.id, form);
        toast.success("Cập nhật thành công");
      } else {
        await create(form);
        toast.success("Thêm mới thành công");
      }

      setOpen(false);
      setEditing(null);
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa check-in point này?")) return;
    await remove(id);
  };

  const handleShowQR = async (workareaId: string) => {
    setQrWorkareaId(workareaId);
    setQrUrl(null);
    setQrModal(true);

    const url = await getQrUrl(workareaId);
    if (url) {
      qrUrlRef.current = url;
      setQrUrl(url);
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;

    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `workarea-${qrWorkareaId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const workareaMap = useMemo(() => {
    const map: Record<string, any> = {};
    workareas.forEach((w) => {
      if (w?.id) {
        map[w.id] = w;
      }
    });
    return map;
  }, [workareas]);

  // ================= UI =================
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý điểm Check-in</h1>

          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm điểm Check-in
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách ({items.length})</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Code</TableHead>
                      {/* <TableHead>WorkArea</TableHead> */}
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.code}</TableCell>
                        {/* <TableCell>
                          {workareaMap[item.workareaId]?.name ?? "—"}
                        </TableCell> */}

                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() => handleShowQR(item.workareaId)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>

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
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* ================= PAGINATION UI ================= */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Trước
                  </Button>

                  <span className="text-sm text-gray-500">
                    Trang {currentPage}
                  </span>

                  <Button
                    disabled={items.length < pageSize}
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

      {/* FORM */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật điểm Check-in" : "Tạo điểm Check-in"}
      >
        <WorkareaCheckinPointForm
          initialData={editing}
          workareas={workareas}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>

      {/* QR MODAL */}
      <StandardDialog
        open={qrModal}
        onOpenChange={setQrModal}
        title={`QR Check-in`}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          {qrUrl ? (
            <>
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-64 h-64 border rounded-lg"
              />

              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải về PNG
              </Button>
            </>
          ) : (
            <div className="w-64 h-64 flex items-center justify-center border rounded-lg bg-gray-50">
              <p className="text-gray-400 text-sm">Đang tải QR...</p>
            </div>
          )}
        </div>
      </StandardDialog>
    </div>
  );
}
