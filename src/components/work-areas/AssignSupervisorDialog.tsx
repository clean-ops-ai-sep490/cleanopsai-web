"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  useAssignSupervisorToWorkArea,
  useAuthSupervisors,
} from "@/hooks/useSupervisors";
import { useTaskSchedulesByWorkArea } from "@/hooks/useTaskSchedules";
import { getWorkAreasPaginatedNew, getWorkAreaById } from "@/lib/work-area-api";
import { getAuthSupervisors } from "@/lib/supervisor-api";
import { Loader2, Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssignSupervisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSupervisorId?: string;
}

export function AssignSupervisorDialog({
  open,
  onOpenChange,
  initialSupervisorId,
}: AssignSupervisorDialogProps) {
  const [selectedWorkAreaId, setSelectedWorkAreaId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  
  // Set initial supervisor if provided
  useEffect(() => {
    if (initialSupervisorId) {
      setSelectedSupervisorId(initialSupervisorId);
    }
  }, [initialSupervisorId, open]);

  const assignMutation = useAssignSupervisorToWorkArea();

  // Fetch workers for selected work area
  const { data: taskData, isLoading: isLoadingWorkers } = useTaskSchedulesByWorkArea(
    selectedWorkAreaId,
    { pageSize: 100 }
  );

  // Extract unique workers from task schedules
  const workers = taskData?.content ? Array.from(
    new Map(
      (taskData.content as any[])
        .filter((task: any) => task.assigneeId)
        .map((task: any) => [task.assigneeId, { id: task.assigneeId, name: task.assigneeName }])
    ).values()
  ) as { id: string; name: string }[] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkAreaId || !selectedSupervisorId) {
      return;
    }

    try {
      await assignMutation.mutateAsync({
        workAreaId: selectedWorkAreaId,
        supervisorId: selectedSupervisorId,
        workerIds: workers.map(w => w.id),
      });

      // Reset form and close dialog
      handleCancel();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleCancel = () => {
    setSelectedWorkAreaId("");
    if (!initialSupervisorId) {
      setSelectedSupervisorId("");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Phân công giám sát viên
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="supervisor" className="text-sm font-semibold text-slate-700">
              Giám sát viên *
            </Label>
            <SearchableSelect
              value={selectedSupervisorId}
              onValueChange={setSelectedSupervisorId}
              placeholder="Chọn giám sát viên"
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["auth-supervisors", "infinite"]}
              queryFn={(page, pageSize, search) => 
                getAuthSupervisors({ pageNumber: page, pageSize, search }).then(res => ({
                  ...res,
                  content: res.content.map((item: any) => ({
                    ...item,
                    id: item.id,
                    name: item.fullName
                  }))
                }))
              }
              getItemById={(id) => 
                getAuthSupervisors({ pageNumber: 1, pageSize: 1 }).then(res => {
                  const item = res.content.find((i: any) => i.id === id);
                  return item ? { ...item, id: item.id, name: item.fullName } : null;
                })
              }
              displayFormatter={(item: any) => (
                <div className="flex flex-col">
                  <span className="font-medium">{item.fullName}</span>
                  <span className="text-xs text-slate-500">{item.email}</span>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workArea" className="text-sm font-semibold text-slate-700">
              Khu vực làm việc *
            </Label>
            <SearchableSelect
              value={selectedWorkAreaId}
              onValueChange={setSelectedWorkAreaId}
              placeholder="Chọn khu vực làm việc"
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["work-areas", "infinite"]}
              queryFn={(page, pageSize, search) => 
                getWorkAreasPaginatedNew(page, pageSize, { search }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                }))
              }
              getItemById={(id) => 
                getWorkAreaById(id).then(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }
            />
          </div>

          {selectedWorkAreaId && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span>Nhân viên trong khu vực</span>
                </div>
                <Badge variant="outline" className="bg-white">
                  {workers.length} nhân viên
                </Badge>
              </div>

              {isLoadingWorkers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : workers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                  {workers.map((worker: any) => (
                    <div 
                      key={worker.id}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 truncate">{worker.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-slate-500 italic">
                  Chưa có nhân viên nào được gán vào khu vực này qua lịch trình.
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={assignMutation.isPending}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={assignMutation.isPending}
              disabled={
                !selectedWorkAreaId ||
                !selectedSupervisorId ||
                workers.length === 0
              }
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
            >
              Xác nhận phân công
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
