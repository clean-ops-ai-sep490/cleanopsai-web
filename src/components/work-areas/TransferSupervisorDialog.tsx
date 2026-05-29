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
import { useUpdateSupervisorAssignment } from "@/hooks/useSupervisors";
import { getWorkAreasPaginatedNew, getWorkAreaById } from "@/lib/work-area-api";
import { getAssignedWorkAreas } from "@/lib/supervisor-api";
import { User, MapPin, ArrowRight } from "lucide-react";

interface TransferSupervisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisor: {
    id: string;
    fullName: string;
    email: string;
    currentWorkAreaId?: string;
    currentWorkAreaName?: string;
  } | null;
}

export function TransferSupervisorDialog({
  open,
  onOpenChange,
  supervisor,
}: TransferSupervisorDialogProps) {
  const [selectedWorkAreaId, setSelectedWorkAreaId] = useState("");
  const updateMutation = useUpdateSupervisorAssignment();

  // Reset selected work area when supervisor changes or dialog opens
  useEffect(() => {
    if (open) {
      setSelectedWorkAreaId("");
    }
  }, [supervisor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supervisor || !selectedWorkAreaId) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        supervisorId: supervisor.id,
        workAreaId: selectedWorkAreaId,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Điều chuyển khu vực làm việc
          </DialogTitle>
        </DialogHeader>

        {supervisor && (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Giám sát viên Info */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950 text-sm">
                    {supervisor.fullName}
                  </h4>
                  <p className="text-xs text-slate-500">{supervisor.email}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">Khu vực hiện tại:</span>
                </div>
                <span className="font-semibold text-indigo-600">
                  {supervisor.currentWorkAreaName || "Chưa phân công"}
                </span>
              </div>
            </div>

            {/* Hướng điều chuyển trực quan */}
            <div className="flex items-center justify-center gap-4 py-1 text-slate-400">
              <span className="text-xs font-medium text-slate-500">
                {supervisor.currentWorkAreaName || "Chưa phân công"}
              </span>
              <ArrowRight className="h-4 w-4 animate-pulse text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">
                Khu vực mới
              </span>
            </div>

            {/* Chọn Khu vực mới */}
            <div className="space-y-2">
              <Label htmlFor="workArea" className="text-sm font-semibold text-slate-700">
                Khu vực làm việc mới *
              </Label>
              <SearchableSelect
                value={selectedWorkAreaId}
                onValueChange={setSelectedWorkAreaId}
                placeholder="Chọn khu vực làm việc mới"
                useInfiniteLoading={true}
                showSearch={false}
                pageSize={10}
                queryKey={["assigned-work-areas", "infinite"]}
                queryFn={(page, pageSize) =>
                  getAssignedWorkAreas({ pageNumber: page, pageSize }).then((res) => ({
                    ...res,
                    content: res.content
                      .filter((item) => (item.workAreaId || item.id) !== supervisor.currentWorkAreaId) // Exclude current work area
                      .map((item) => ({
                        ...item,
                        id: item.workAreaId || item.id || "",
                        name: item.workAreaName || item.name || "",
                      })),
                  }))
                }
                getItemById={(id) =>
                  getWorkAreaById(id).then((item) => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || "",
                  }))
                }
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={updateMutation.isPending}
                disabled={!selectedWorkAreaId || selectedWorkAreaId === supervisor.currentWorkAreaId}
                className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                Xác nhận điều chuyển
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
