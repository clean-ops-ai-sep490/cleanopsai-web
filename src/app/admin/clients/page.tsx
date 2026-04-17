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

import { usePagination } from "@/hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { getClientsPaginatedNew } from "@/lib/client-api";

export default function ClientsPage() {
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["clients", pagination.paginationParams],
    queryFn: () =>
      getClientsPaginatedNew(
        pagination.currentPage,
        pagination.pageSize
      ),
  });

  const clients = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>
              Khách hàng ({data?.totalElements ?? 0})
            </CardTitle>
          </CardHeader>

          <CardContent>
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
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
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