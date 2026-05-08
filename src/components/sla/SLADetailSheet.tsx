"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useSLAWithDetails } from "@/hooks/useSLAQuery";
import { Clock, Activity, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateServiceType } from "@/lib/utils/translate";

interface SLADetailSheetProps {
  slaId: string | null;
  onClose: () => void;
}

export function SLADetailSheet({ slaId, onClose }: SLADetailSheetProps) {
  const { sla, shifts, tasks, isLoading } = useSLAWithDetails(slaId || "");

  const getRecurrenceText = (type: string) => {
    const map: Record<string, string> = {
      Daily: "Hàng ngày",
      Weekly: "Hàng tuần",
      Monthly: "Hàng tháng",
      Yearly: "Hàng năm",
    };
    return map[type] || type;
  };

  return (
    <Sheet open={!!slaId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-slate-900">
            Chi tiết điều khoản
          </SheetTitle>
          <SheetDescription>
            Xem tần suất  ca làm việc và công việc của điều khoản này.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : sla ? (
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tên điều khoản</h4>
                <p className="text-sm font-semibold text-slate-900">{sla.name}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Dịch vụ</h4>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                    {translateServiceType(sla.serviceType)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Khu vực</h4>
                  <p className="text-sm font-medium text-slate-700">{sla.workAreaName || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Shifts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-bold text-slate-900">Ca làm việc ({shifts.length})</h4>
              </div>
              <div className="space-y-2">
                {shifts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có ca làm việc</p>
                ) : (
                  shifts.map((shift) => (
                    <div key={shift.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-slate-800">{shift.name}</p>
                        <div className="flex items-center gap-1 text-primary">
                          <Users className="h-3 w-3" />
                          <span className="text-xs font-bold">{shift.requiredWorker}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                        {shift.breakTime > 0 && ` • Nghỉ ${shift.breakTime}m`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-bold text-slate-900">Công việc ({tasks.length})</h4>
              </div>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có công việc</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-bold text-slate-800 mb-1">{task.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-500">
                          {getRecurrenceText(task.recurrenceType)}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          Mỗi {task.recurrenceConfig.interval} {task.recurrenceType === 'Daily' ? 'ngày' : task.recurrenceType === 'Weekly' ? 'tuần' : 'tháng'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-12">Không tìm thấy thông tin</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
