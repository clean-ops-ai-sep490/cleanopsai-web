"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, QrCode, Download, X } from "lucide-react";
import { StandardDialog } from "@/components/ui/standard-dialog";
import WorkareaCheckinPointForm from "./WorkareaCheckinForm";
import { useWorkareaCheckin } from "@/hooks/useWorkareaCheckin";
import { useWorkArea } from "@/hooks/useWorkarea";

export default function WorkareaCheckinPointsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // 👈 state cho QR modal
  const [qrModal, setQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrWorkareaId, setQrWorkareaId] = useState<string>("");
  const qrUrlRef = useRef<string | null>(null);

  const {
    items, loading, fetchAll, create, update, remove, downloadQr, getQrUrl,
  } = useWorkareaCheckin();

  const { items: workareas, fetchAllWorkAreas } = useWorkArea();

  useEffect(() => {
    fetchAll();
    fetchAllWorkAreas();
  }, [fetchAll, fetchAllWorkAreas]);

  // Cleanup blob URL khi đóng modal
  useEffect(() => {
    if (!qrModal && qrUrlRef.current) {
      window.URL.revokeObjectURL(qrUrlRef.current);
      qrUrlRef.current = null;
      setQrUrl(null);
    }
  }, [qrModal]);

  const handleSubmit = async (form: any) => {
    if (editing) await update(editing.id, form);
    else await create(form);
    setOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa check-in point này?")) return;
    await remove(id);
  };

  // 👈 Mở modal và load QR
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

  // 👈 Download từ blob url đang có
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
    workareas.forEach((w) => { map[w.id] = w; });
    return map;
  }, [workareas]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý điểm checkin</h1>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Check-in Point
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check-in Points ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>WorkArea</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{workareaMap[item.workareaId]?.name ?? "—"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {/* 👈 Đổi handleQR → handleShowQR */}
                        <Button variant="ghost" onClick={() => handleShowQR(item.workareaId)}>
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => { setEditing(item); setOpen(true); }}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form dialog */}
      <StandardDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Cập nhật Check-in Point" : "Tạo Check-in Point"}
      >
        <WorkareaCheckinPointForm
          initialData={editing}
          workareas={workareas}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </StandardDialog>

      {/* 👈 QR Modal */}
      <StandardDialog
        open={qrModal}
        onOpenChange={setQrModal}
        title={`QR Check-in — ${workareaMap[qrWorkareaId]?.name ?? qrWorkareaId}`}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          {qrUrl ? (
            <>
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-64 h-64 border rounded-lg"
              />
              <p className="text-sm text-gray-500 text-center">
                In mã này dán tại khu vực làm việc để worker quét check-in
              </p>
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