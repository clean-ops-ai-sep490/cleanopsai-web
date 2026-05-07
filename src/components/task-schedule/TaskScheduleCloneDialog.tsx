"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskSchedule } from "@/types/schedule";
import { TaskScheduleForm } from "./TaskScheduleForm";
import { useCreateTaskSchedule } from "@/hooks/useTaskSchedules";
import { getWorkAreaDetailById } from "@/lib/work-area-detail-api";
import { getWorkAreaById } from "@/lib/work-area-api";
import { getZoneById } from "@/lib/zone-api";
import { getSLATaskById } from "@/lib/sla-api";
import { Loader2, Copy } from "lucide-react";

interface TaskScheduleCloneDialogProps {
  schedule: TaskSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TaskScheduleCloneDialog({
  schedule,
  open,
  onOpenChange,
  onSuccess,
}: TaskScheduleCloneDialogProps) {
  const createMutation = useCreateTaskSchedule();
  const [resolvedData, setResolvedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function resolveIds() {
      if (!schedule || !open) return;

      setIsLoading(true);
      try {
        // Normalize schedule keys (PascalCase -> camelCase)
        const normalizedSchedule: any = {};
        Object.entries(schedule).forEach(([key, value]) => {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          normalizedSchedule[camelKey] = value;
        });

        // 1. Resolve Location Chain (Bottom-up)
        const detail = await getWorkAreaDetailById(normalizedSchedule.workAreaDetailId);
        const workAreaId = detail.workAreaId || normalizedSchedule.workAreaId;
        
        const workArea = await getWorkAreaById(workAreaId);
        const zoneId = workArea.zoneId;
        
        const zone = await getZoneById(zoneId);
        const locationId = zone.locationId;

        // 2. Resolve SLA ID
        const slaTask = await getSLATaskById(normalizedSchedule.slaTaskId);
        const slaId = slaTask.slaId || normalizedSchedule.slaId;

        // 3. Prepare Initial Data for Form
        const initialData = {
          ...normalizedSchedule,
          id: undefined, // Clear ID for creation
          name: `${normalizedSchedule.name || ""} (Bản sao)`,
          slaId,
          locationId,
          zoneId,
          workAreaId,
          // Clear assignee as per user request "cho một worker khác"
          assigneeId: "",
          assigneeName: "",
        };

        setResolvedData(initialData);
      } catch (error) {
        console.error("Failed to resolve hierarchical IDs for cloning:", error);
        // Fallback to what we have if resolution fails
        setResolvedData({
          ...schedule,
          id: undefined,
          name: `${schedule.name} (Bản sao)`,
          assigneeId: "",
          assigneeName: "",
        });
      } finally {
        setIsLoading(false);
      }
    }

    resolveIds();
  }, [schedule, open]);

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] p-0 border-none shadow-2xl flex flex-col overflow-hidden bg-white">
        <DialogHeader className="p-6 bg-slate-50 border-b shrink-0">
          <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Copy className="w-5 h-5" />
            </div>
            Sao chép lịch trình
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-slate-500 font-medium animate-pulse">
                Đang giải mã cấu trúc khu vực và SLA...
              </p>
            </div>
          ) : resolvedData ? (
            <TaskScheduleForm
              initialData={resolvedData}
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
              submitButtonText="Tạo bản sao"
              isModal={true}
            />
          ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
