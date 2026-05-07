"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { FileText } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { usePagination } from "@/hooks/usePagination";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function ContractsPage() {
  const [clientId, setClientId] = useState<string | undefined>();
  const getCleanFileUrl = (url?: string) => url?.split("?")[0] ?? "";
  const pagination = usePagination({ initialPage: 1, initialPageSize: 10 });
  const { data, isLoading, error, refetch } = useContracts({ ...pagination.paginationParams, clientId } as any);
  const { data: clientsData } = useClients({ pageNumber: 1, pageSize: 100 });

  const contracts = data?.items ?? [];
  const totalPages = Math.ceil((data?.totalCount ?? 0) / (pagination?.pageSize ?? 10));

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý hợp đồng" description="Danh sách hợp đồng và file đính kèm theo khách hàng." />

      <SectionCard>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchableSelect
            value={clientId || "all"}
            onValueChange={(value: string) => {
              setClientId(value === "all" ? undefined : value);
              pagination.goToFirstPage();
            }}
            placeholder="Lọc theo khách hàng"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["clients", "infinite"]}
            queryFn={(page: number, pageSize: number, search?: string) =>
              import("@/lib/client-api").then((m) =>
                m.getClientsPaginatedNew(page, pageSize, { search }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: String(item.id),
                    name: item.name || ""
                  }))
                })),
              )
            }
            getItemById={(id: string) =>
              id === "all"
                ? Promise.resolve({ id: "all", name: "Tất cả" })
                : import("@/lib/client-api").then((m) => 
                    m.getClientById(id).then(item => ({
                      ...item,
                      id: String(item.id),
                      name: item.name || ""
                    }))
                  )
            }
            className="w-full md:w-[250px]"
          />
        </div>
      </SectionCard>
      {isLoading ? (
        <ListPageSkeleton cards={3} rows={6} />
      ) : error ? (
        <ErrorState title="Không thể tải hợp đồng" description="Vui lòng thử lại sau." onAction={() => refetch()} />
      ) : contracts.length === 0 ? (
        <EmptyState title="Chưa có hợp đồng" description="Hợp đồng sẽ hiển thị tại đây khi có dữ liệu." icon={<FileText className="h-10 w-10" />} />
      ) : (
        <SectionCard title={`Hợp đồng (${data?.totalCount ?? 0})`}>
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
                  <TableCell className="max-w-[280px] truncate">{c.name}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{c.clientName}</TableCell>
                  <TableCell>{c.urlFile ? <a href={getCleanFileUrl(c.urlFile)} target="_blank" className="text-(--app-primary) underline">Tải file</a> : "-"}</TableCell>
                  <TableCell>{new Date(c.created).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <Button variant="outline" disabled={pagination.currentPage === 1} onClick={pagination.prevPage}>Trước</Button>
            <span>Trang {pagination.currentPage} / {totalPages || 1}</span>
            <Button variant="outline" disabled={pagination.currentPage >= totalPages} onClick={pagination.nextPage}>Sau</Button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
