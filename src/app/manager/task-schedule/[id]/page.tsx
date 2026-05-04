"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Clock, MapPin, User, Calendar, FileText, Settings, Loader2 } from "lucide-react";
import { useTaskSchedule, useActivateTaskSchedule, useDeactivateTaskSchedule } from "@/hooks/useTaskSchedules";

export default function TaskScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: schedule, isLoading, error } = useTaskSchedule(id);
  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  const handleToggleStatus = async () => {
    if (!schedule) return;
    if (schedule.isActive) await deactivateMutation.mutateAsync(schedule.id);
    else await activateMutation.mutateAsync(schedule.id);
    setConfirmOpen(false);
  };

  const actionLabel = schedule?.isActive ? "Tạm dừng" : "Kích hoạt";

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={schedule?.name || "Chi tiết lịch trình"}
          description="Xem chi tiết lịch trình và cấu hình lặp lại."
          breadcrumbs={<Button variant="ghost" size="sm" onClick={() => router.push("/manager/task-schedule")}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
          action={schedule ? <div className="flex gap-2"><Button variant="outline" onClick={() => setConfirmOpen(true)} disabled={activateMutation.isPending || deactivateMutation.isPending}>{actionLabel}</Button><Button asChild><Link href={`/manager/task-schedule/${id}/edit`}><Edit className="h-4 w-4" />Chỉnh sửa</Link></Button></div> : undefined}
        />

        {isLoading ? (
          <DetailPageSkeleton />
        ) : error || !schedule ? (
          <ErrorState title="Không thể tải lịch trình" description="Lịch trình có thể đã bị xóa hoặc bạn không có quyền truy cập." onAction={() => router.push("/manager/task-schedule")} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <SectionCard title="Thông tin cơ bản">
                <div className="space-y-4 text-sm">
                  {schedule.description ? <div><p className="text-slate-500">Mô tả</p><p className="text-slate-700">{schedule.description}</p></div> : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><p className="text-slate-500">Thời gian thực hiện</p><p className="text-slate-950">{schedule.durationMinutes} phút</p></div>
                    <div><p className="text-slate-500">Loại lặp lại</p><p className="text-slate-950">{schedule.recurrenceType}</p></div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Thông tin phân công">
                <div className="space-y-4 text-sm">
                  <div><p className="text-slate-500">Người thực hiện</p><p className="text-slate-950">{schedule.assigneeName}</p></div>
                  <div><p className="text-slate-500">Địa điểm</p><p className="text-slate-950">{schedule.displayLocation}</p></div>
                </div>
              </SectionCard>

              {schedule.recurrenceConfig ? (
                <SectionCard title="Cấu hình lặp lại">
                  <div className="space-y-4 text-sm">
                    {schedule.recurrenceConfig.times?.length ? <div><p className="text-slate-500">Thời gian trong ngày</p><div className="mt-2 flex flex-wrap gap-2">{schedule.recurrenceConfig.times.map((time, index) => <Badge key={index} variant="outline">{time}</Badge>)}</div></div> : null}
                    {schedule.recurrenceConfig.daysOfWeek?.length ? <div><p className="text-slate-500">Ngày trong tuần</p><div className="mt-2 flex flex-wrap gap-2">{schedule.recurrenceConfig.daysOfWeek.map((day, index) => <Badge key={index} variant="outline">{day}</Badge>)}</div></div> : null}
                    {schedule.recurrenceConfig.daysOfMonth?.length ? <div><p className="text-slate-500">Ngày trong tháng</p><div className="mt-2 flex flex-wrap gap-2">{schedule.recurrenceConfig.daysOfMonth.map((day, index) => <Badge key={index} variant="outline">Ngày {day}</Badge>)}</div></div> : null}
                  </div>
                </SectionCard>
              ) : null}
            </div>

            <div className="space-y-6">
              <SectionCard title="Thời gian hợp đồng">
                <div className="space-y-3 text-sm">
                  <div><p className="text-slate-500">Ngày bắt đầu</p><p className="text-slate-950">{new Date(schedule.contractStartDate).toLocaleDateString("vi-VN")}</p></div>
                  <Separator />
                  <div><p className="text-slate-500">Ngày kết thúc</p><p className="text-slate-950">{new Date(schedule.contractEndDate).toLocaleDateString("vi-VN")}</p></div>
                </div>
              </SectionCard>

              <SectionCard title="Thông tin hệ thống">
                <div className="space-y-3 text-sm">
                  <div><p className="text-slate-500">SOP ID</p><p className="break-all font-mono text-xs text-slate-700">{schedule.sopId}</p></div>
                  <div><p className="text-slate-500">Work Area ID</p><p className="break-all font-mono text-xs text-slate-700">{schedule.workAreaId}</p></div>
                  <div><p className="text-slate-500">Assignee ID</p><p className="break-all font-mono text-xs text-slate-700">{schedule.assigneeId}</p></div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmOpen} title={actionLabel} description="Đây là thao tác nhạy cảm và sẽ ảnh hưởng trạng thái lịch trình." confirmLabel={actionLabel} onConfirm={handleToggleStatus} onOpenChange={setConfirmOpen} isLoading={activateMutation.isPending || deactivateMutation.isPending} />
    </>
  );
}
