"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientsPaginatedNew } from "@/lib/client-api";
import { usePagination } from "@/hooks/usePagination";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Users } from "lucide-react";

export default function ClientsPage() {
  const pagination = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["clients", pagination.paginationParams],
    queryFn: () => getClientsPaginatedNew(pagination.currentPage, pagination.pageSize),
  });

  const clients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý khách hàng" description="Danh sách khách hàng theo dạng bảng gọn, dễ đọc." />
      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải khách hàng" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : clients.length === 0 ? (
        <EmptyState title="Chưa có khách hàng" description="Dữ liệu khách hàng sẽ hiển thị tại đây khi có bản ghi." icon={<Users className="h-10 w-10" />} />
      ) : (
        <SectionCard title={`Khách hàng (${data?.totalElements ?? 0})`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-[320px] truncate">{c.name}</TableCell>
                  <TableCell className="max-w-[320px] truncate">{c.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <Button variant="outline" disabled={pagination.currentPage === 1} onClick={pagination.prevPage}>Trước</Button>
            <span>Trang {pagination.currentPage} / {totalPages}</span>
            <Button variant="outline" disabled={pagination.currentPage >= totalPages} onClick={pagination.nextPage}>Sau</Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
