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
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toastUtils } from "@/lib/utils/toast-utils";
import { generateTaskAssignments } from "@/lib/task-schedule-api";
import { Input } from "@/components/ui/input";

interface AssignTaskScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskScheduleId: string;
  taskScheduleName: string;
}

export function AssignTaskScheduleDialog({
  open,
  onOpenChange,
  taskScheduleId,
  taskScheduleName,
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
        taskScheduleIds: [taskScheduleId],
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Phân công lịch trình công việc</DialogTitle>
          <DialogDescription>
            Tạo phân công công việc thủ công cho lịch trình:{" "}
            <span className="font-semibold text-black">{taskScheduleName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* From Date */}
          <div className="space-y-2">
            <Label htmlFor="fromDate">Ngày bắt đầu *</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border-[#e5e5e5]"
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label htmlFor="toDate">Ngày kết thúc *</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border-[#e5e5e5]"
              min={fromDate || undefined}
            />
          </div>

          {/* Info */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Task assignment sẽ được tạo dựa trên recurrence pattern của task
                schedule
              </li>
              <li>
                Chỉ tạo task assignment cho các ngày trong khoảng thời gian đã
                chọn
              </li>
              <li>Task assignment đã tồn tại sẽ không bị tạo lại</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !fromDate || !toDate}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo Task Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
