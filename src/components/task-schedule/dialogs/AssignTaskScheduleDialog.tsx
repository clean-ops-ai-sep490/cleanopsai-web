"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import { toastUtils } from "@/lib/utils/toast-utils";
import { generateTaskAssignments } from "@/lib/task-schedule-api";
import { Input } from "@/components/ui/input";

interface AssignTaskScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskScheduleIds: string[];
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function AssignTaskScheduleDialog({
  open,
  onOpenChange,
  taskScheduleIds,
  title = "Phân công lịch trình công việc",
  description,
  onSuccess,
}: AssignTaskScheduleDialogProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      toastUtils.error("Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toastUtils.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await generateTaskAssignments({
        taskScheduleIds: taskScheduleIds,
        fromDate: fromDate,
        toDate: toDate,
      });

      toastUtils.success(
        `Đã tạo ${response.generatedCount} task assignment thành công!`,
        response.message,
      );

      onOpenChange(false);
      // Reset form
      setFromDate("");
      setToDate("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to generate task assignments:", error);
      toastUtils.error(
        "Không thể tạo task assignment",
        error instanceof Error ? error.message : "Vui lòng thử lại sau",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">{title}</DialogTitle>
          <DialogDescription className="text-slate-500 pt-1">
            {description || `Tạo phân công công việc thủ công cho ${taskScheduleIds.length} lịch trình đã chọn.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày bắt đầu</Label>
              <div className="relative">
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white border-slate-200 rounded-xl h-11 focus:border-primary transition-all pl-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày kết thúc</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white border-slate-200 rounded-xl h-11 focus:border-primary transition-all pl-3"
                min={fromDate || undefined}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-[12px] leading-relaxed text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Cơ chế hoạt động:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Phân công dựa trên tần suất lặp lại</li>
                  <li>Không tạo đè lên các phân công đã có</li>
                  <li>Chỉ áp dụng cho các lịch trình đang hoạt động</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl text-slate-400 hover:text-slate-900"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !fromDate || !toDate}
            className="rounded-xl px-6 h-11 font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận phân công"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
