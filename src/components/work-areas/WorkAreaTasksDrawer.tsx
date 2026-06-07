"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskSchedulesByWorkArea, useDeleteTaskSchedule } from "@/hooks/useTaskSchedules";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardList, User, MapPin, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface WorkAreaTasksDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workArea: {
    id: string;
    name: string;
    displayLocation?: string;
  } | null;
}

export function WorkAreaTasksDrawer({
  open,
  onOpenChange,
  workArea,
}: WorkAreaTasksDrawerProps) {
  const { data, isLoading, error } = useTaskSchedulesByWorkArea(
    workArea?.id || "",
    { pageNumber: 1, pageSize: 100 }
  );

  const schedules = data?.content || [];
  const deleteMutation = useDeleteTaskSchedule();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      queryClient.invalidateQueries({ queryKey: ["supervisorWorkAreas"] });
      queryClient.invalidateQueries({ queryKey: ["authSupervisors"] });
      queryClient.invalidateQueries({ queryKey: ["taskSchedules"] });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0 flex flex-col h-full border-l border-slate-100 shadow-2xl bg-slate-50" showCloseButton={true}>
        <SheetHeader className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-primary mb-1">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Nhiệm vụ & Nhân sự
            </span>
          </div>
          <SheetTitle className="text-xl font-bold text-slate-900 leading-tight">
            {workArea?.name || "Chi tiết khu vực"}
          </SheetTitle>
          {workArea?.displayLocation && (
            <SheetDescription className="flex items-start gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>{workArea.displayLocation}</span>
            </SheetDescription>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-slate-400">
                  Đang tải danh sách công việc...
                </p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  Không thể tải danh sách công việc của khu vực này.
                </span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-2xl">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Khu vực trống công việc
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Chưa có nhiệm vụ hoặc nhân sự nào được phân công tại khu vực này.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Danh sách nhiệm vụ ({schedules.length})
                </div>

                {schedules.map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {schedule.name}
                      </h4>
                      {schedule.displayLocation && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {schedule.displayLocation}
                        </p>
                      )}
                    </div>

                    <hr className="border-slate-50" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Nhân viên phụ trách:</span>
                      <div className="flex items-center gap-2">
                        {schedule.assigneeName ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary-soft text-primary-strong hover:bg-primary-soft border-transparent rounded-full px-3 py-0.5 font-medium flex items-center gap-1 shrink-0"
                          >
                            <User className="h-3 w-3" />
                            {schedule.assigneeName}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-400 border-slate-200 rounded-full px-3 py-0.5 font-medium"
                          >
                            Chưa phân công
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100"
                          onClick={() => setDeleteTarget(schedule.id)}
                          disabled={deleteMutation.isPending}
                          title="Hủy phân công công việc"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold text-slate-500 hover:bg-slate-50"
          >
            Đóng
          </Button>
        </div>
      </SheetContent>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hủy phân công công việc?"
        description="Thao tác này sẽ xóa lịch trình khỏi khu vực. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa"
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </Sheet>
  );
}
