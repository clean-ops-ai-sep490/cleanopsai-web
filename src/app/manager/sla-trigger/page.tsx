"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSLAsPaginated, getSLAsFiltered } from "@/lib/sla-api";
import { getContracts } from "@/lib/contract-api";
import { useDeleteSLA } from "@/hooks/useSLAQuery";
import { usePagination } from "@/hooks/usePagination";
import { translateServiceType } from "@/lib/utils/translate";
import { useLoading } from "@/contexts/LoadingContext";
import { SLADetailSheet } from "@/components/sla/SLADetailSheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SLATriggerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [viewDetailId, setViewDetailId] = useState<string | null>(null);
  const router = useRouter();
  const { startLoading } = useLoading();

  // Single source of truth for pagination state
  const { currentPage, pageSize, setPage, paginationParams, goToFirstPage } = usePagination({ initialPageSize: 10 });
  
  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts-all"],
    queryFn: getContracts,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["slas", currentPage, pageSize, searchTerm, serviceTypeFilter],
    queryFn: () => {
      const params: any = {
        search: searchTerm || undefined,
        serviceType: serviceTypeFilter !== "all" ? serviceTypeFilter : undefined,
      };

      return getSLAsPaginated(currentPage, pageSize, params);
    },
  });

  const deleteMutation = useDeleteSLA();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  const columns = [
    {
      header: "Tên SLA",
      className: "pl-6 font-bold text-slate-900",
      accessorKey: "name"
    },
    {
      header: "Loại dịch vụ",
      cell: (sla: any) => <StatusBadge status={translateServiceType(sla.serviceType)} />
    },
    {
      header: "Hợp đồng",
      className: "text-slate-600 font-medium",
      cell: (sla: any) => sla.contractName || "Không rõ hợp đồng"
    },
    {
      header: "Mô tả",
      className: "text-slate-500 italic max-w-[400px] truncate",
      cell: (sla: any) => sla.description || "Không có mô tả"
    },
    {
      header: "Thao tác",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (sla: any) => (
        <div className="flex items-center justify-end gap-1">
          {/* <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            onClick={() => setViewDetailId(sla.id)}
            title="Xem nhanh cấu hình"
          >
            <Info className="h-4 w-4" />
          </Button> */}
          <Button 
            asChild 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
            onClick={() => startLoading("Đang tải chi tiết...")}
          >
            <Link href={`/manager/sla-trigger/${sla.id}`}><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
            onClick={() => startLoading("Đang chuẩn bị trình chỉnh sửa...")}
          >
            <Link href={`/manager/sla-trigger/${sla.id}/edit`}><Edit className="h-4 w-4" /></Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" 
            onClick={() => setDeleteTarget(sla)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Điều khoản hợp đồng"
        description="Quản lý các điều khoản công việc bằng dạng danh sách rõ ràng, dễ lọc và dễ kiểm tra."
        action={
          <Button 
            onClick={() => startLoading("Đang chuẩn bị trình tạo SLA...")}
            asChild 
            className="rounded-xl"
          >
            <Link href="/manager/sla-trigger/create">
              <Plus className="h-4 w-4 mr-2" />
              Tạo điều khoản mới
            </Link>
          </Button>
        }
      />



      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        emptyMessage="Chưa có điều khoản phù hợp"
        search={{
          value: searchTerm,
          onChange: (val) => { setSearchTerm(val); goToFirstPage(); },
          placeholder: "Tìm kiếm điều khoản theo tên..."
        }}
        filters={
          <div className="flex items-center gap-3">
            <Select value={serviceTypeFilter} onValueChange={(value) => { setServiceTypeFilter(value); goToFirstPage(); }}>
              <SelectTrigger className="h-11 w-[180px] border-slate-200/60 bg-white text-xs font-bold text-slate-400 shadow-none rounded-xl uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <SelectValue placeholder="Dịch vụ" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                <SelectItem value="Cleaning">Vệ sinh</SelectItem>
                <SelectItem value="Maintenance">Bảo trì</SelectItem>
                <SelectItem value="Repair">Sửa chữa</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value="all" 
              onValueChange={(value) => { 
                if (value !== "all") {
                  startLoading("Đang tải danh sách điều khoản của hợp đồng...");
                  router.push(`/manager/sla-trigger/by-contract/${value}`);
                }
              }}
            >
              <SelectTrigger className="h-11 w-[220px] border-slate-200/60 bg-white text-xs font-bold text-slate-400 shadow-none rounded-xl uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <SelectValue placeholder="Xem theo Hợp đồng" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Chọn hợp đồng để xem...</SelectItem>
                {Array.isArray(contracts) && contracts.map((contract: any) => (
                  <SelectItem key={contract.id} value={contract.id || ""}>
                    {contract.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        pagination={{
          currentPage,
          totalPages: data?.totalPages || 1,
          pageSize,
          totalElements: data?.totalElements || 0,
          onPageChange: setPage
        }}
      />

      <ConfirmDialog 
        open={!!deleteTarget} 
        title="Xóa điều khoản này?" 
        description="Hành động này không thể hoàn tác. Các điều kiện kích hoạt liên quan sẽ bị vô hiệu hóa." 
        confirmLabel="Xóa vĩnh viễn" 
        onConfirm={handleDelete} 
        onOpenChange={(open) => !open && setDeleteTarget(null)} 
      />

      <SLADetailSheet 
        slaId={viewDetailId} 
        onClose={() => setViewDetailId(null)} 
      />
    </div>
  );
}
