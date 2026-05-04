"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationWithInfo } from "@/components/ui/pagination";
import { ListPageSkeleton } from "@/components/ui/page-skeleton";
import { Search, Loader2, Calendar, UserPlus, Clock, MapPin, User, ListTodo, CheckCircle2, PauseCircle } from "lucide-react";
import { useTaskSchedules, useActivateTaskSchedule, useDeactivateTaskSchedule } from "@/hooks/useTaskSchedules";
import { usePagination } from "@/hooks/usePagination";
import { AssignTaskScheduleDialog } from "@/components/task-schedule/dialogs/AssignTaskScheduleDialog";

export default function TaskScheduleListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{ id: string; name: string } | null>(null);
  const [confirmSchedule, setConfirmSchedule] = useState<any | null>(null);
  const [processingScheduleId, setProcessingScheduleId] = useState<string | null>(null);

  const pagination = usePagination({ initialPageSize: 9 });
  const { data, isLoading, error, refetch, isRefetching } = useTaskSchedules({ pageNumber: pagination.currentPage, pageSize: pagination.pageSize, search: searchQuery || undefined });
  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  const schedules = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const stats = useMemo(() => ({
    active: schedules.filter((s: any) => s.isActive).length,
    inactive: schedules.filter((s: any) => !s.isActive).length,
    total: totalElements,
  }), [schedules, totalElements]);

  const handleToggleStatus = async () => {
    if (!confirmSchedule) return;
    const schedule = confirmSchedule;
    setProcessingScheduleId(schedule.id);
    try {
      if (schedule.isActive) await deactivateMutation.mutateAsync(schedule.id);
      else await activateMutation.mutateAsync(schedule.id);
      setConfirmSchedule(null);
    } finally {
      setProcessingScheduleId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader title="Lịch trình công việc" description="Quản lý lịch trình công việc với dạng danh sách rõ ràng và thao tác bật/tắt an toàn." action={<div className="flex gap-2"><Button variant="outline" asChild><Link href="/manager/task-schedule/calendar"><Calendar className="h-4 w-4" />Xem lịch</Link></Button><Button asChild><Link href="/manager/task-schedule/create">Tạo nhiệm vụ mới</Link></Button></div>} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SectionCard>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ListTodo className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Tổng lịch trình</p>
                <div className="text-2xl font-semibold text-slate-950">{stats.total}</div>
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Đang hoạt động</p>
                <div className="text-2xl font-semibold text-slate-950">{stats.active}</div>
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <PauseCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Tạm dừng</p>
                <div className="text-2xl font-semibold text-slate-950">{stats.inactive}</div>
              </div>
            </div>
          </SectionCard>
        </div>

        <FilterBar>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm lịch trình..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); pagination.goToFirstPage(); }} />
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>{isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Làm mới</Button>
        </FilterBar>

        {isLoading ? <ListPageSkeleton cards={3} rows={6} /> : error ? <ErrorState title="Không thể tải lịch trình" description="Vui lòng thử lại sau." onAction={() => refetch()} /> : schedules.length === 0 ? <EmptyState title={searchQuery ? "Không tìm thấy lịch trình" : "Chưa có lịch trình"} description="Tạo task schedule để bắt đầu phân công công việc." actionLabel="Tạo task mới" onAction={() => window.location.assign('/manager/task-schedule/create')} icon={<Calendar className="h-10 w-10" />} /> : (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{schedules.map((schedule: any) => (<SectionCard key={schedule.id} title={schedule.name} description={schedule.description || 'Không có mô tả'} action={<StatusBadge status={schedule.isActive ? 'Active' : 'Paused'} />} className="hover:shadow-[0_12px_34px_rgba(15,23,42,0.08)]"><div className="space-y-3 text-sm text-slate-600"><div className="flex items-center justify-between"><span className="flex items-center gap-2"><User className="h-4 w-4" />Người thực hiện</span><span className="font-medium text-slate-950">{schedule.assigneeName}</span></div><div className="flex items-center justify-between"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Địa điểm</span><span className="max-w-[160px] truncate font-medium text-slate-950">{schedule.displayLocation}</span></div><div className="flex items-center justify-between"><span className="flex items-center gap-2"><Clock className="h-4 w-4" />Thời gian</span><span className="font-medium text-slate-950">{schedule.durationMinutes} phút</span></div><div className="flex items-center justify-between"><span>Lặp lại</span><Badge variant="outline">{schedule.recurrenceType}</Badge></div><div className="flex gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setSelectedSchedule({ id: schedule.id, name: schedule.name })}>Phân công</Button><Button variant="outline" size="sm" onClick={() => setConfirmSchedule(schedule)}>{schedule.isActive ? 'Tắt' : 'Bật'}</Button></div></div></SectionCard>))}</div>)}

        {!isLoading && !error && schedules.length > 0 ? <PaginationWithInfo currentPage={pagination.currentPage} totalPages={totalPages || 1} pageSize={pagination.pageSize} totalElements={totalElements} onPageChange={pagination.setPage} /> : null}
      </div>

      {selectedSchedule ? <AssignTaskScheduleDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} taskScheduleId={selectedSchedule.id} taskScheduleName={selectedSchedule.name} /> : null}
      <ConfirmDialog open={!!confirmSchedule} title={confirmSchedule?.isActive ? 'Tạm dừng lịch trình?' : 'Kích hoạt lịch trình?'} description="Đây là thao tác nhạy cảm, cần xác nhận trước khi tiếp tục." confirmLabel="Xác nhận" onConfirm={handleToggleStatus} onOpenChange={(open) => !open && setConfirmSchedule(null)} isLoading={processingScheduleId !== null} />
    </>
  );
}
