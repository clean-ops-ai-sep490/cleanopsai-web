"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
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
  Save,
  X,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { TaskAssignment, TaskAssignmentUpdatePayload } from "@/types/task-assignment";
import { useDeleteTaskAssignment, useUpdateTaskAssignment } from "@/hooks/useTaskAssignments";
import { useWorkers } from "@/hooks/useWorkers";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDetailDialogProps {
  task: TaskAssignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          Hoàn thành
        </Badge>
      );
    case "InProgress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          Đang thực hiện
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3.5 h-3.5 mr-1" />
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
  const [isEditing, setIsEditing] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<TaskAssignmentUpdatePayload>>({});

  useEffect(() => {
    if (open) {
      setEditData({
        taskName: task.taskName || task.nameAdhocTask || "Task",
        scheduledStartAt: task.scheduledStartAt,
        durationMinutes: task.durationMinutes,
        assigneeId: task.assigneeId,
        assigneeName: task.assigneeName,
        displayLocation: task.displayLocation,
      });
      setIsEditing(false);
    }
  }, [open, task]);

  const deleteMutation = useDeleteTaskAssignment();
  const updateMutation = useUpdateTaskAssignment();
  const { data: workers } = useWorkers();

  const startTime = format(parseISO(task.scheduledStartAt.replace("Z", "")), "HH:mm");
  const endTime = format(parseISO(task.scheduledEndAt.replace("Z", "")), "HH:mm");
  const date = format(parseISO(task.scheduledStartAt.replace("Z", "")), "EEEE, dd/MM/yyyy", {
    locale: vi,
  });

  // Parse editData.scheduledStartAt into Date and HH:mm time
  const getEditDateTime = () => {
    if (!editData.scheduledStartAt) return { date: undefined, time: "" };
    try {
      const parsedDate = parseISO(editData.scheduledStartAt.replace("Z", ""));
      if (isNaN(parsedDate.getTime())) return { date: undefined, time: "" };
      const timeStr = format(parsedDate, "HH:mm");
      return { date: parsedDate, time: timeStr };
    } catch (e) {
      return { date: undefined, time: "" };
    }
  };

  const { date: editDate, time: editTime } = getEditDateTime();

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    const timeStr = editTime || "08:00";
    const yyyymmdd = format(newDate, "yyyy-MM-dd");
    const updatedStartAt = `${yyyymmdd}T${timeStr}:00Z`;
    setEditData((prev) => ({ ...prev, scheduledStartAt: updatedStartAt }));
  };

  const handleTimeChange = (newTimeStr: string) => {
    const d = editDate || new Date();
    const yyyymmdd = format(d, "yyyy-MM-dd");
    const updatedStartAt = `${yyyymmdd}T${newTimeStr}:00Z`;
    setEditData((prev) => ({ ...prev, scheduledStartAt: updatedStartAt }));
  };

  const handleCancel = async () => {
    try {
      await deleteMutation.mutateAsync(task.id);
      setCancelConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {}
  };

  const handleUpdate = async () => {
    try {
      const selectedWorker = workers?.content?.find((w: any) => w.id === editData.assigneeId);
      
      const payload: TaskAssignmentUpdatePayload = {
        taskName: editData.taskName || task.taskName || task.nameAdhocTask || "Task",
        scheduledStartAt: editData.scheduledStartAt || task.scheduledStartAt,
        durationMinutes: editData.durationMinutes || task.durationMinutes,
        assigneeId: editData.assigneeId!,
        assigneeName: selectedWorker?.fullName || editData.assigneeName || task.assigneeName,
        displayLocation: editData.displayLocation || task.displayLocation,
      };

      await updateMutation.mutateAsync({ id: task.id, data: payload });
      setIsEditing(false);
    } catch (error) {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {isEditing ? (
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3 mb-1.5">
              {getStatusBadge(task.status)}
              {task.isAdhocTask && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Đột xuất
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl">
              Cập nhật công việc
            </DialogTitle>
          </DialogHeader>
        ) : (
          <DialogHeader className="mb-2">
            <div className="flex items-center gap-3 mb-1.5">
              {getStatusBadge(task.status)}
              {task.isAdhocTask && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Đột xuất
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl">
              {task.taskName || task.nameAdhocTask || "Chi tiết công việc"}
            </DialogTitle>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{task.displayLocation}</span>
            </div>
          </DialogHeader>
        )}

        {isEditing ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-200">
            {/* Tên công việc */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tên công việc
              </label>
              <Input
                value={editData.taskName || ""}
                onChange={(e) => setEditData({ ...editData, taskName: e.target.value })}
                className="rounded-xl border-slate-200 bg-white"
                placeholder="Nhập tên công việc"
              />
            </div>

            {/* Địa điểm thực hiện */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Địa điểm hiển thị
              </label>
              <Input
                value={editData.displayLocation || ""}
                onChange={(e) => setEditData({ ...editData, displayLocation: e.target.value })}
                className="rounded-xl border-slate-200 bg-white"
                placeholder="Nhập địa điểm thực hiện"
              />
            </div>

            {/* Ngày và Giờ bắt đầu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ngày thực hiện
                </label>
                <DatePicker
                  date={editDate}
                  onSelect={handleDateChange}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Giờ bắt đầu
                </label>
                <TimePicker
                  value={editTime}
                  onChange={handleTimeChange}
                  format="12"
                  className="rounded-xl border-slate-200 bg-white h-10"
                />
              </div>
            </div>

            {/* Thời lượng thực hiện */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Thời lượng (phút)
              </label>
              <Input
                type="number"
                min={1}
                value={editData.durationMinutes || ""}
                onChange={(e) => setEditData({ ...editData, durationMinutes: parseInt(e.target.value) || 0 })}
                className="rounded-xl border-slate-200 bg-white"
                placeholder="Nhập thời lượng thực hiện"
              />
            </div>

            {/* Nhân viên phụ trách */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Nhân viên phụ trách
              </label>
              <Select 
                value={editData.assigneeId} 
                onValueChange={(val) => setEditData({ ...editData, assigneeId: val })}
              >
                <SelectTrigger className="w-full rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {workers?.content?.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Ngày thực hiện
                </div>
                <div className="text-sm font-semibold text-slate-900">{date}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian
                </div>
                <div className="text-sm font-semibold text-slate-900">{startTime} - {endTime}</div>
              </div>
            </div>

            <div className="space-y-3 py-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Nhân viên phụ trách
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                    {task.assigneeName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{task.assigneeName}</div>
                    {task.assigneeId !== task.originalAssigneeId && (
                      <div className="text-[10px] font-medium text-amber-600">Đã đổi từ: {task.originalAssigneeName}</div>
                    )}
                  </div>
                </div>
                {task.status === "NotStarted" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:bg-primary/5 hover:text-primary rounded-lg font-semibold h-8 px-3"
                    onClick={() => setIsEditing(true)}
                  >
                    Thay đổi
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        <DialogFooter className="mt-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              className="text-slate-500"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
            
            <div className="flex items-center gap-2">
              {task.status === "NotStarted" && (
                isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={updateMutation.isPending}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Lưu thay đổi
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                      onClick={() => setCancelConfirmOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hủy lịch
                    </Button>
                    <Button
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Hủy công việc?"
        description="Bản phân công này sẽ bị xóa vĩnh viễn khỏi lịch trình. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xác nhận hủy"
        confirmVariant="destructive"
        onConfirm={handleCancel}
        isLoading={deleteMutation.isPending}
      />
    </Dialog>
  );
}
