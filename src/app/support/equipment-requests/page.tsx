"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Check, X } from "lucide-react";

import {
  useEquipmentRequests,
  useEquipmentRequestsByStatus,
  useReviewEquipmentRequest,
} from "@/hooks/useEquipmentRequest";

import { StandardDialog } from "@/components/ui/standard-dialog";
import { usePagination } from "@/hooks/usePagination";

/* ================= PAGE ================= */

export default function SupportEquipmentRequestsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");

  const [selected, setSelected] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const reviewMutation = useReviewEquipmentRequest();

  /* ================= PAGINATION ================= */
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      pagination.setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* ================= RESET PAGE WHEN FILTER CHANGE ================= */
  useEffect(() => {
    pagination.setPage(1);
  }, [statusFilter]);

  /* ================= API LOGIC (CORE FIX) ================= */

  const isAll = statusFilter === "All";

  const allQuery = useEquipmentRequests({
    pageNumber: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  const statusQuery = useEquipmentRequestsByStatus(
    isAll ? undefined : statusFilter,
    {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
    }
  );

  // CHỈ PICK 1 QUERY ACTIVE
  const activeQuery = isAll ? allQuery : statusQuery;

  const data = activeQuery.data;
  const isLoading = activeQuery.isLoading;
  const refetch = activeQuery.refetch;

  const items = useMemo(() => data?.items || [], [data]);

  /* ================= CLIENT SEARCH ================= */
  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;

    return items.filter(
      (x: any) =>
        x.workerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        x.reason?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [items, debouncedSearch]);

  /* ================= REVIEW ================= */
  const handleReview = async (status: "Approved" | "Rejected") => {
    if (!selected) return;

    await reviewMutation.mutateAsync({
      id: selected.id,
      data: { status },
    });

    setOpenDialog(false);
    setSelected(null);
    refetch();
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Yêu cầu thiết bị</h1>
            <p className="text-muted-foreground">
              Review yêu cầu thiết bị từ worker
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <Input
              placeholder="Tìm theo worker / lý do..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tất cả</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Approved">Đã duyệt</SelectItem>
              <SelectItem value="Rejected">Bị từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Danh sách ({data?.totalCount ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                Không có dữ liệu
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">
                        {req.workerName}
                      </TableCell>

                      <TableCell>{req.reason || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          className={
                            req.status === "Pending"
                              ? "bg-yellow-500 text-white"
                              : req.status === "Approved"
                              ? "bg-green-600 text-white"
                              : "bg-red-500 text-white"
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {new Date(req.created).toLocaleString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelected(req);
                            setOpenDialog(true);
                          }}
                        >
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <Button
                disabled={pagination.currentPage === 1}
                onClick={pagination.prevPage}
              >
                Trước
              </Button>

              <div className="text-sm text-gray-500">
                Trang {pagination.currentPage} /{" "}
                {Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)}
              </div>

              <Button
                disabled={
                  pagination.currentPage >=
                  Math.ceil((data?.totalCount ?? 0) / pagination.pageSize)
                }
                onClick={pagination.nextPage}
              >
                Sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG */}
      <StandardDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Đánh giá yêu cầu"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Worker</p>
              <p className="font-semibold">{selected.workerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Lí do</p>
              <p>{selected.reason || "-"}</p>
            </div>

            {/* STATUS */}
<div>
  <p className="text-sm text-gray-500">Trạng thái</p>

  <Badge
    className={
      selected.status === "Pending"
        ? "bg-yellow-500 text-white"
        : selected.status === "Approved"
        ? "bg-green-600 text-white"
        : "bg-red-500 text-white"
    }
  >
    {selected.status}
  </Badge>
</div>

{/* ACTION BUTTONS */}
<div className="flex gap-3 justify-end pt-4">
  
  <Button
    variant="destructive"
    className="bg-red-600 text-white"
    onClick={() => handleReview("Rejected")}
  >
    <X className="w-4 h-4 mr-1" />
    Từ chối
  </Button>

  <Button
    className="bg-green-600 text-white"
    onClick={() => handleReview("Approved")}
  >
    <Check className="w-4 h-4 mr-1" />
    Đồng ý
  </Button>
</div>
          </div>
        )}
      </StandardDialog>
    </div>
  );
}