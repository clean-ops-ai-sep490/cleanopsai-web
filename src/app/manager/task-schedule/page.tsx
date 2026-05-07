"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar,
  User,
  MapPin,
  Clock,
  Zap,
  Play,
  Pause,
} from "lucide-react";
import { useTaskSchedules, useActivateTaskSchedule, useDeactivateTaskSchedule } from "@/hooks/useTaskSchedules";
import { usePagination } from "@/hooks/usePagination";
import { TaskScheduleDetailDrawer } from "@/components/task-schedule/TaskScheduleDetailDrawer";
import { TaskSchedule } from "@/types/schedule";
import { AssignTaskScheduleDialog } from "@/components/task-schedule/dialogs/AssignTaskScheduleDialog";
import { toastUtils } from "@/lib/utils/toast-utils";
import { useLoading } from "@/contexts/LoadingContext";

const FREQUENCY_LABELS: Record<string, string> = {
  Daily: "Hàng ngày",
  Weekly: "Hàng tuần",
  Monthly: "Hàng tháng",
  Quarterly: "Hàng quý",
  Yearly: "Hàng năm",
  OnDemand: "Theo yêu cầu",
};

const STATUS_LABELS: Record<string, string> = {
  Active: "Hoạt động",
  Paused: "Tạm dừng",
  Inactive: "Ngừng hoạt động",
};

export default function TaskScheduleListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<'activate' | 'deactivate' | null>(null);
  const [detailSchedule, setDetailSchedule] = useState<TaskSchedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const pagination = usePagination({ initialPageSize: 10 });
  const { data, isLoading, refetch } = useTaskSchedules({ 
    pageNumber: pagination.currentPage, 
    pageSize: pagination.pageSize, 
    search: searchQuery || undefined 
  });
  
  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  const schedules = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handleBulkStatusChange = async () => {
    if (!bulkStatusTarget || selectedIds.length === 0) return;
    
    try {
      const mutation = bulkStatusTarget === 'activate' ? activateMutation : deactivateMutation;
      
      // Simple loop for now as the backend might not have bulk status change
      await Promise.all(selectedIds.map(id => mutation.mutateAsync(id)));
      
      toastUtils.success(`Đã ${bulkStatusTarget === 'activate' ? 'kích hoạt' : 'tạm dừng'} ${selectedIds.length} lịch trình.`);
      setSelectedIds([]);
      setBulkStatusTarget(null);
    } catch (error) {
      toastUtils.error("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  const handleRowClick = (schedule: TaskSchedule) => {
    setDetailSchedule(schedule);
    setDetailOpen(true);
  };

  const columns = [
    {
      header: "Lịch trình",
      className: "pl-2 py-4",
      cell: (s: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-slate-900">{s.name}</span>
          <span className="text-[11px] text-slate-400 italic line-clamp-1">{s.description || "Không có mô tả"}</span>
        </div>
      )
    },
    {
      header: "Người thực hiện",
      cell: (s: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-600">{s.assigneeName || "Chưa phân công"}</span>
        </div>
      )
    },
    {
      header: "Địa điểm",
      cell: (s: any) => (
        <div className="flex items-center gap-2 text-slate-500 max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
          <span className="text-xs truncate">{s.displayLocation}</span>
        </div>
      )
    },
    {
      header: "Tần suất",
      cell: (s: any) => (
        <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-slate-200">
          {FREQUENCY_LABELS[s.recurrenceType] || s.recurrenceType}
        </Badge>
      )
    },
    {
      header: "Thời lượng",
      cell: (s: any) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-xs font-medium">{s.durationMinutes} phút</span>
        </div>
      )
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      cell: (s: any) => (
        <StatusBadge 
          status={s.isActive ? STATUS_LABELS.Active : STATUS_LABELS.Paused} 
          variant={s.isActive ? "success" : "warning"}
        />
      )
    }
  ];

  const { startLoading } = useLoading();

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Lịch trình công việc" 
        description="Quản lý các kịch bản công việc định kỳ và phân công nhân sự." 
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200"
              onClick={() => startLoading("Đang tải lịch trình...")}
              asChild
            >
              <Link href="/manager/task-schedule/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Xem lịch
              </Link>
            </Button>
            <Button 
              className="rounded-xl"
              onClick={() => startLoading("Đang chuẩn bị form...")}
              asChild
            >
              <Link href="/manager/task-schedule/create">
                <Plus className="h-4 w-4 mr-2" />
                Tạo lịch mới
              </Link>
            </Button>
          </div>
        } 
      />

      <div className="flex items-center justify-between min-h-[44px]">
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Đã chọn {selectedIds.length}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setAssignDialogOpen(true)}
                className="bg-primary text-white hover:bg-primary/90 rounded-xl h-10 px-5 font-bold text-xs"
              >
                <Zap className="h-3.5 w-3.5 mr-2" />
                Phân công nhanh
              </Button>
              <Button 
                variant="outline"
                onClick={() => setBulkStatusTarget('activate')}
                className="rounded-xl h-10 px-4 text-xs font-bold border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100"
              >
                <Play className="h-3.5 w-3.5 mr-2" />
                Bật
              </Button>
              <Button 
                variant="outline"
                onClick={() => setBulkStatusTarget('deactivate')}
                className="rounded-xl h-10 px-4 text-xs font-bold border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100"
              >
                <Pause className="h-3.5 w-3.5 mr-2" />
                Tắt
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                Hủy chọn
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">Chọn các lịch trình để thực hiện thao tác hàng loạt.</div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={schedules}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy lịch trình nào"
        onRowClick={handleRowClick}
        selection={{
          selectedIds,
          onSelectionChange: setSelectedIds,
          idKey: "id"
        }}
        search={{
          value: searchQuery,
          onChange: (val) => { setSearchQuery(val); pagination.goToFirstPage(); },
          placeholder: "Tìm theo tên lịch trình hoặc người thực hiện..."
        }}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: totalPages || 1,
          pageSize: pagination.pageSize,
          totalElements: totalElements,
          onPageChange: pagination.setPage
        }}
      />

      <TaskScheduleDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        schedule={detailSchedule}
        onSuccess={refetch}
      />

      <AssignTaskScheduleDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen} 
        taskScheduleIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          refetch();
        }}
      />

      <ConfirmDialog 
        open={!!bulkStatusTarget} 
        title={bulkStatusTarget === 'activate' ? 'Kích hoạt hàng loạt?' : 'Tạm dừng hàng loạt?'} 
        description={`Bạn có chắc chắn muốn thay đổi trạng thái cho ${selectedIds.length} lịch trình đã chọn?`} 
        confirmLabel="Xác nhận" 
        onConfirm={handleBulkStatusChange} 
        onOpenChange={(open) => !open && setBulkStatusTarget(null)} 
        isLoading={activateMutation.isPending || deactivateMutation.isPending} 
      />
    </div>
  );
}
