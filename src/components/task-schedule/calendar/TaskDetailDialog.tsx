"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { TaskAssignment } from "@/types/task-assignment";

interface TaskDetailDialogProps {
  task: TaskAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Hoàn thành
        </Badge>
      );
    case "InProgress":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <AlertCircle className="w-3 h-3 mr-1" />
          Đang thực hiện
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          <Clock className="w-3 h-3 mr-1" />
          Chưa bắt đầu
        </Badge>
      );
  }
};

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const startTime = format(parseISO(task.scheduledStartAt), "HH:mm");
  const endTime = format(parseISO(task.scheduledEndAt), "HH:mm");
  const date = format(parseISO(task.scheduledStartAt), "dd/MM/yyyy", {
    locale: vi,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {task.isAdhocTask ? task.nameAdhocTask : "Chi tiết công việc"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            {task.isAdhocTask && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Công việc đột xuất
              </Badge>
            )}
          </div>

          <Separator />

          {/* Task Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Ngày làm việc
                </div>
                <div className="text-sm text-gray-900">{date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Thời gian
                </div>
                <div className="text-sm text-gray-900">
                  {startTime} - {endTime}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Người thực hiện
                </div>
                <div className="text-sm text-gray-900">{task.assigneeName}</div>
                {task.assigneeId !== task.originalAssigneeId && (
                  <div className="text-xs text-gray-500 mt-1">
                    Gốc: {task.originalAssigneeName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Địa điểm
                </div>
                <div className="text-sm text-gray-900">
                  {task.displayLocation}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            {task.status === "NotStarted" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hủy task
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-[#308cab] text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
