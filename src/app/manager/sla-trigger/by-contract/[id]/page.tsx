"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSLAsFiltered, getSLAShiftsBySLA, getSLATasksBySLA } from "@/lib/sla-api";
import { getContractById } from "@/lib/contract-api";
import type { SLAShift, SLATask } from "@/types/sla";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Clock, 
  Activity, 
  Users, 
  MapPin, 
  ClipboardList,
  Loader2,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translateServiceType, translateRecurrenceType } from "@/lib/utils/translate";

// Component to render individual SLA details within the contract view
function SLADetailCard({ sla }: { sla: any }) {
  // Fetch shifts for this specific SLA
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ["sla-shifts", sla.id],
    queryFn: () => getSLAShiftsBySLA(sla.id),
    enabled: !!sla.id,
  });

  // Fetch tasks for this specific SLA
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["sla-tasks", sla.id],
    queryFn: () => getSLATasksBySLA(sla.id),
    enabled: !!sla.id,
  });

  const isLoadingDetails = isLoadingShifts || isLoadingTasks;

  return (
    <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                {sla.name}
              </CardTitle>
              <Badge variant="secondary" className="bg-primary-soft text-primary-strong border-none text-[10px] uppercase tracking-wider font-bold">
                {translateServiceType(sla.serviceType)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{sla.workAreaName || "Khu vực chưa xác định"}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs font-bold border-slate-200" asChild>
            <a href={`/manager/sla-trigger/${sla.id}`}>Xem chi tiết đầy đủ</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Shifts Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold">Ca làm việc ({shifts.length})</h4>
            </div>
            
            {isLoadingDetails ? (
              <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Đang tải ca làm việc...</span>
              </div>
            ) : shifts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50/30 rounded-xl">Chưa cấu hình ca làm việc</p>
            ) : (
              <div className="grid gap-2">
                {shifts.map((shift: SLAShift) => (
                  <div key={shift.id} className="p-3 rounded-xl border border-slate-50 bg-white shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{shift.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                        {shift.breakTime > 0 && ` • Nghỉ ${shift.breakTime}m`}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-6 border-slate-100 text-slate-600 bg-slate-50 gap-1 px-2">
                      <Users className="h-3 w-3" />
                      <span className="text-[11px] font-bold">{shift.requiredWorker}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                <ClipboardList className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold">Danh mục công việc ({tasks.length})</h4>
            </div>

            {isLoadingDetails ? (
              <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Đang tải công việc...</span>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50/30 rounded-xl">Chưa cấu hình công việc</p>
            ) : (
              <div className="grid gap-2">
                {tasks.map((task: SLATask) => (
                  <div key={task.id} className="p-3 rounded-xl border border-slate-50 bg-white shadow-sm flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 truncate pr-4">{task.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="h-6 border-blue-100 text-blue-600 bg-blue-50 text-[10px] font-bold">
                        {translateRecurrenceType(task.recurrenceType)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContractSLAsPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const { data: contract } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => getContractById(contractId),
    enabled: !!contractId,
  });

  const { data: slasData, isLoading } = useQuery({
    queryKey: ["slas-by-contract", contractId],
    queryFn: () => getSLAsFiltered(1, 100, { contractId }),
    enabled: !!contractId,
  });

  const slas = slasData?.content || [];

  return (
    <div className="space-y-8 pb-12 animate-rise-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-xl text-slate-500 hover:text-primary -ml-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách
        </Button>
      </div>

      <PageHeader
        title={`Tổng quan điều khoản: ${contract?.name || "..."}`}
        description="Toàn bộ cấu hình ca làm việc và công việc thuộc hợp đồng này."
        icon={<Activity className="h-6 w-6 text-primary" />}
      />

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="mt-4 text-slate-400 font-medium">Đang tổng hợp dữ liệu SLA...</p>
          </div>
        ) : slas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">Hợp đồng này chưa có SLA nào</p>
            <p className="text-slate-400 text-sm mt-1">Vui lòng tạo SLA mới hoặc gán SLA vào hợp đồng này.</p>
          </div>
        ) : (
          slas.map((sla) => (
            <SLADetailCard key={sla.id} sla={sla} />
          ))
        )}
      </div>
    </div>
  );
}
