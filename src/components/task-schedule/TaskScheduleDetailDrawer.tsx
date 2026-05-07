"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  Edit,
  ClipboardList,
  Info,
  Layers,
  Loader2,
} from "lucide-react";
import { TaskSchedule, TaskScheduleStep } from "@/types/schedule";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useActivateTaskSchedule,
  useDeactivateTaskSchedule,
  useTaskSchedule,
} from "@/hooks/useTaskSchedules";
import { useState } from "react";
import { TaskScheduleEditDialog } from "./TaskScheduleEditDialog";
import { TaskScheduleCloneDialog } from "./TaskScheduleCloneDialog";
import { Copy } from "lucide-react";

const FREQUENCY_LABELS: Record<string, string> = {
  Daily: "Hàng ngày",
  Weekly: "Hàng tuần",
  Monthly: "Hàng tháng",
  Quarterly: "Hàng quý",
  Yearly: "Hàng năm",
  OnDemand: "Theo yêu cầu",
};

const STATUS_LABELS: Record<string, string> = {
  Active: "Đang hoạt động",
  Paused: "Tạm dừng",
  Inactive: "Ngừng hoạt động",
};

interface TaskScheduleDetailDrawerProps {
  schedule: TaskSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TaskScheduleDetailDrawer({
  schedule: initialSchedule,
  open,
  onOpenChange,
  onSuccess,
}: TaskScheduleDetailDrawerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);

  // Fetch full details when open
  const { data: fullSchedule, isLoading: isFetching } = useTaskSchedule(
    initialSchedule?.id || "",
  );
  const schedule = fullSchedule || initialSchedule;

  const activateMutation = useActivateTaskSchedule();
  const deactivateMutation = useDeactivateTaskSchedule();

  if (!initialSchedule) return null;

  const handleToggleStatus = async () => {
    if (!schedule) return;
    try {
      if (schedule.isActive) {
        await deactivateMutation.mutateAsync(schedule.id);
      } else {
        await activateMutation.mutateAsync(schedule.id);
      }
      onSuccess?.();
    } catch (error) {}
  };

  const renderStepDetail = (step: TaskScheduleStep) => {
    try {
      const config = JSON.parse(step.ConfigDetail);

      if (config.method) {
        return (
          <div className="flex items-center gap-2 text-slate-600">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-100"
            >
              Phương thức: {config.method.toUpperCase()}
            </Badge>
          </div>
        );
      }

      if (config.requiredEquipment) {
        return (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Trang thiết bị cần thiết
            </span>
            <div className="flex flex-wrap gap-1.5">
              {config.requiredEquipment.map((eq: any) => (
                <Badge
                  key={eq.id}
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 border-transparent text-[10px]"
                >
                  {eq.name}
                </Badge>
              ))}
            </div>
          </div>
        );
      }

      if (config.requiredPPE) {
        return (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Bảo hộ lao động
            </span>
            <div className="flex flex-wrap gap-1.5">
              {config.requiredPPE.map((ppe: any, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border-amber-100 text-[10px]"
                >
                  {ppe.name}
                </Badge>
              ))}
            </div>
          </div>
        );
      }

      if (config.items) {
        return (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Danh mục công việc (Checklist)
            </span>
            <ul className="space-y-1.5">
              {config.items.map((item: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-600"
                >
                  <div className="h-4 w-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (config.minPhotos) {
        return (
          <div className="flex items-center gap-2 text-slate-600">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-100"
            >
              Yêu cầu {config.minPhotos} ảnh{" "}
              {config.phase === "before" ? "trước" : "sau"} khi làm
            </Badge>
          </div>
        );
      }

      if (config.requireNote !== undefined) {
        return (
          <div className="text-xs text-slate-500">
            Ghi chú: {config.requireNote ? "Bắt buộc" : "Không bắt buộc"}
          </div>
        );
      }

      return (
        <div className="text-xs text-slate-400 italic">
          Cấu hình: {step.ConfigDetail}
        </div>
      );
    } catch (e) {
      return (
        <div className="text-xs text-rose-500 italic">
          Lỗi định dạng cấu hình
        </div>
      );
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl p-0 flex flex-col h-full border-l-0 shadow-2xl">
          <div className="p-6 pb-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <StatusBadge 
                  status={schedule?.isActive ? STATUS_LABELS.Active : STATUS_LABELS.Paused} 
                  variant={schedule?.isActive ? "success" : "warning"}
                />
                <Badge
                  variant="outline"
                  className="rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-slate-200"
                >
                  {FREQUENCY_LABELS[schedule?.recurrenceType || ""] || schedule?.recurrenceType || initialSchedule.recurrenceType}
                </Badge>
              </div>
              <SheetTitle className="text-xl font-extrabold text-slate-900 line-clamp-1">
                {schedule?.name || initialSchedule.name}
              </SheetTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditDialogOpen(true)}
                className="rounded-xl border-slate-200 h-9 w-9"
                disabled={isFetching}
              >
                <Edit className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCloneDialogOpen(true)}
                className="rounded-xl border-slate-200 h-9 w-9"
                disabled={isFetching}
                title="Sao chép lịch trình"
              >
                <Copy className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="outline"
                className={`rounded-xl h-9 px-4 font-bold text-xs ${schedule?.isActive ? "text-rose-600 hover:bg-rose-50 border-rose-100" : "text-emerald-600 hover:bg-emerald-50 border-emerald-100"}`}
                onClick={handleToggleStatus}
                disabled={
                  isFetching ||
                  activateMutation.isPending ||
                  deactivateMutation.isPending
                }
              >
                {(activateMutation.isPending ||
                  deactivateMutation.isPending) && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                {schedule?.isActive ? "Tạm dừng" : "Kích hoạt"}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {isFetching && !fullSchedule ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-slate-400">
                  Đang tải chi tiết lịch trình...
                </p>
              </div>
            ) : schedule ? (
              <div className="p-6 space-y-8">
                {/* Basic Info Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">Thông tin chung</h3>
                  </div>

                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
                    {schedule.description && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Mô tả công việc
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {schedule.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Thời lượng
                        </span>
                        <p className="text-sm font-bold text-slate-700">
                          {schedule.durationMinutes} phút
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Layers className="h-3 w-3" /> Tần suất
                        </span>
                        <p className="text-sm font-bold text-slate-700">
                          {FREQUENCY_LABELS[schedule.recurrenceType] || schedule.recurrenceType}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Location & Personnel Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">Địa điểm & Nhân sự</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Khu vực làm việc
                        </span>
                        <p className="text-sm font-bold text-slate-700 leading-tight">
                          {schedule.displayLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Người thực hiện
                        </span>
                        <p className="text-sm font-bold text-slate-900">
                          {schedule.assigneeName || "Chưa phân công"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Recurrence Config Section */}
                {schedule.recurrenceConfig && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm">Thời gian</h3>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 space-y-6">
                      {schedule.recurrenceConfig.times &&
                        schedule.recurrenceConfig.times.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Khung giờ thực hiện
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {schedule.recurrenceConfig.times.map(
                                (time, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="bg-white border-slate-200 text-slate-700 px-3 py-1 font-mono text-xs shadow-sm"
                                  >
                                    {time.substring(0, 5)}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {schedule.recurrenceType === "Weekly" &&
                        schedule.recurrenceConfig.daysOfWeek && (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Ngày trong tuần
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: "CN", value: "Sunday" },
                                { label: "T2", value: "Monday" },
                                { label: "T3", value: "Tuesday" },
                                { label: "T4", value: "Wednesday" },
                                { label: "T5", value: "Thursday" },
                                { label: "T6", value: "Friday" },
                                { label: "T7", value: "Saturday" },
                              ].map((day, idx) => {
                                  const days = schedule.recurrenceConfig
                                    .daysOfWeek as any[];
                                  const isActive =
                                    days?.includes(day.value) ||
                                    days?.includes(idx) ||
                                    days?.includes(idx.toString());
                                  return (
                                    <div
                                      key={idx}
                                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                                        isActive
                                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-110"
                                          : "bg-white text-slate-300 border-slate-100"
                                      }`}
                                    >
                                      {day.label}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                    </div>
                  </section>
                )}

                {/* Steps/Metadata Section */}
                {schedule.metadata && schedule.metadata.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-sm">
                        Quy trình thực hiện (SOP)
                      </h3>
                    </div>

                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {schedule.metadata
                        .sort((a, b) => a.StepOrder - b.StepOrder)
                        .map((step, idx) => (
                          <div key={step.Id} className="relative pl-12">
                            <div className="absolute left-0 top-0 h-10 w-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center z-10 shadow-sm">
                              <span className="text-xs font-black text-slate-400">
                                {step.StepOrder}
                              </span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-primary/20 transition-colors">
                              {renderStepDetail(step)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 mt-auto">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold text-slate-500"
            >
              Đóng
            </Button>
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              className="rounded-xl font-bold px-6"
            >
              Chỉnh sửa chi tiết
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <TaskScheduleEditDialog
        schedule={schedule}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />

      <TaskScheduleCloneDialog
        schedule={schedule}
        open={isCloneDialogOpen}
        onOpenChange={setIsCloneDialogOpen}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
}
