"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { TaskSchedule } from "@/types/schedule";
import { useUpdateTaskSchedule } from "@/hooks/useTaskSchedules";
import { filterWorkers, getWorkerById } from "@/lib/worker-api";
import { Loader2, User, Clock, MapPin, FileText } from "lucide-react";

interface TaskScheduleEditDialogProps {
  schedule: TaskSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TaskScheduleEditDialog({
  schedule,
  open,
  onOpenChange,
  onSuccess,
}: TaskScheduleEditDialogProps) {
  const updateMutation = useUpdateTaskSchedule();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    assigneeId: "",
    assigneeName: "",
    displayLocation: "",
    durationMinutes: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when schedule changes or dialog opens
  useEffect(() => {
    if (schedule && open) {
      setFormData({
        name: schedule.name || "",
        description: schedule.description || "",
        assigneeId: schedule.assigneeId || "",
        assigneeName: schedule.assigneeName || "",
        displayLocation: schedule.displayLocation || "",
        durationMinutes: schedule.durationMinutes || 0,
      });
      setErrors({});
    }
  }, [schedule, open]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Special handler for assignee to update both ID and Name
  const handleAssigneeChange = async (id: string) => {
    if (!id) {
      updateField("assigneeId", "");
      updateField("assigneeName", "");
      return;
    }

    updateField("assigneeId", id);
    try {
      const worker = await getWorkerById(id);
      if (worker) {
        updateField("assigneeName", worker.fullName);
      }
    } catch (error) {
      console.error("Failed to fetch worker details:", error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Tên lịch trình là bắt buộc";
    if (formData.durationMinutes <= 0)
      newErrors.durationMinutes = "Thời gian phải lớn hơn 0";
    if (!formData.assigneeId) newErrors.assigneeId = "Người thực hiện là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!schedule || !validate()) return;

    // Construct a strictly defined payload based on the PUT schema
    // This avoids sending extra fields like 'metadata' or 'id' in the body
    const payload = {
      // Required base IDs from original schedule
      sopId: schedule.sopId,
      slaTaskId: schedule.slaTaskId,
      slaShiftId: schedule.slaShiftId,
      workAreaId: schedule.workAreaId,
      workAreaDetailId: schedule.workAreaDetailId,
      
      // Editable fields from form
      name: formData.name,
      description: formData.description,
      assigneeId: formData.assigneeId,
      assigneeName: formData.assigneeName,
      displayLocation: formData.displayLocation,
      durationMinutes: formData.durationMinutes,
      
      // Fixed fields from original schedule
      recurrenceType: schedule.recurrenceType,
      recurrenceConfig: schedule.recurrenceConfig,
      contractStartDate: schedule.contractStartDate,
      contractEndDate: schedule.contractEndDate,
      isActive: schedule.isActive,
    };

    updateMutation.mutate(
      { id: schedule.id, data: payload as any },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-width-[600px] gap-0 p-0 border-none overflow-hidden bg-white shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            Chỉnh sửa lịch trình
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Cập nhật các thông tin cơ bản cho lịch trình công việc.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Tên lịch trình *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nhập tên lịch trình"
                className={`bg-white border-slate-200 focus:ring-primary/20 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-semibold text-slate-700">
                Thời lượng (phút) *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => updateField("durationMinutes", Number(e.target.value))}
                  className={`pl-10 bg-white border-slate-200 focus:ring-primary/20 ${errors.durationMinutes ? "border-red-500" : ""}`}
                />
              </div>
              {errors.durationMinutes && (
                <p className="text-xs text-red-500">{errors.durationMinutes}</p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Người thực hiện *
            </Label>
            <SearchableSelect
              value={formData.assigneeId}
              onValueChange={handleAssigneeChange}
              placeholder="Chọn nhân viên"
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["workers", "infinite", "edit"]}
              queryFn={(page, pageSize, search) => {
                return filterWorkers({
                  pageNumber: page,
                  pageSize,
                  search: search,
                }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id,
                    name: item.fullName
                  }))
                }));
              }}
              getItemById={(id) => 
                getWorkerById(id).then(item => ({
                  ...item,
                  id: item.id,
                  name: item.fullName
                }))
              }
              displayFormatter={(item: any) => item.fullName}
            />
            {errors.assigneeId && (
              <p className="text-xs text-red-500">{errors.assigneeId}</p>
            )}
          </div>

          {/* Location String */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold text-slate-700">
              Vị trí hiển thị
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="location"
                value={formData.displayLocation}
                onChange={(e) => updateField("displayLocation", e.target.value)}
                placeholder="Ví dụ: Tầng 1 - Sảnh chính"
                className="pl-10 bg-white border-slate-200 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Thêm mô tả chi tiết..."
              className="bg-white border-slate-200 focus:ring-primary/20 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
