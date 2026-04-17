"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { usePagination } from "@/hooks/usePagination";

export default function ContractsPage() {
  const [clientId, setClientId] = useState<string | undefined>();
  const getCleanFileUrl = (url?: string) => url?.split("?")[0] ?? "";

  // ✅ pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading } = useContracts({
    ...pagination.paginationParams,
    clientId,
  } as any);

  const { data: clientsData } = useClients({
    pageNumber: 1,
    pageSize: 100,
  });

  const contracts = data?.items ?? [];
  const totalPages = Math.ceil(
  (data?.totalCount ?? 0) / (pagination?.pageSize ?? 10)
);

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">

  <h1 className="text-2xl font-bold">
    Quản lý Hợp đồng
  </h1>

  {/* FILTER */}
  <Select
    onValueChange={(value) => {
      setClientId(value === "all" ? undefined : value);
      pagination.goToFirstPage();
    }}
  >
    <SelectTrigger className="w-[250px]">
      <SelectValue placeholder="Lọc theo khách hàng" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="all">Tất cả</SelectItem>

      {clientsData?.items?.map((c: any) => (
        <SelectItem key={c.id} value={c.id}>
          {c.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

</div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Hợp đồng ({data?.totalCount ?? 0})</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên hợp đồng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {contracts.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.clientName}</TableCell>

                    <TableCell>
                      {c.urlFile ? (
                        <a
  href={getCleanFileUrl(c.urlFile)}
  target="_blank"
  className="text-blue-500 underline"
>
  Tải file
</a>
                      ) : "-"}
                    </TableCell>

                    <TableCell>
                      {new Date(c.created).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <Button
                disabled={pagination.currentPage === 1}
                onClick={pagination.prevPage}
              >
                Trước
              </Button>

              <div className="text-sm text-gray-500">
                Trang {pagination.currentPage} / {totalPages}
              </div>

              <Button
                disabled={pagination.currentPage >= totalPages}
                onClick={pagination.nextPage}
              >
                Sau
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}