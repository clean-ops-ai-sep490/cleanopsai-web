"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle, Lightbulb, Users } from "lucide-react";
import type { DashboardMetrics, TopWorker, WorkerTotal } from "@/types/dashboard";

interface WorkerProductivityChartProps {
  topWorkers: TopWorker[];
  workerTotal: WorkerTotal;
  metrics: DashboardMetrics;
}

export function WorkerProductivityChart({ topWorkers, workerTotal, metrics }: WorkerProductivityChartProps) {
  const totalAssignedTasks = topWorkers.reduce((sum, worker) => sum + worker.totalTasks, 0);
  const maxTasks = Math.max(...topWorkers.map((worker) => worker.totalTasks), 1);
  const avgTasks = topWorkers.length > 0 ? totalAssignedTasks / topWorkers.length : 0;
  const overloadedWorkers = topWorkers.filter((worker) => avgTasks > 0 && worker.totalTasks > avgTasks * 2);
  const availableWorkers = Math.max(workerTotal.totalWorkers - topWorkers.length, 0);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Năng suất nhân viên</CardTitle>
            <CardDescription>So sánh khối lượng công việc và mức sử dụng nhân lực.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-slate-200 text-slate-600"><Users className="h-3 w-3" />{topWorkers.length}/{workerTotal.totalWorkers} đang hoạt động</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">Tỷ lệ sử dụng nhân lực</span>
            <span className="text-sm font-semibold text-slate-950">{metrics.workerUtilization.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(metrics.workerUtilization, 100)}%` }} />
          </div>
        </div>

        {topWorkers.length === 0 ? (
          <EmptyState
            title="Chưa có nhân viên được giao việc"
            description="Danh sách năng suất sẽ hiển thị sau khi có phân công."
            icon={<Users className="h-10 w-10" />}
          />
        ) : (
          <div className="space-y-4">
            {topWorkers.slice(0, 6).map((worker) => {
              const percentage = totalAssignedTasks > 0 ? (worker.totalTasks / totalAssignedTasks) * 100 : 0;
              const barWidth = (worker.totalTasks / maxTasks) * 100;
              const isOverloaded = avgTasks > 0 && worker.totalTasks > avgTasks * 2;

              return (
                <div key={worker.workerId} className="rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">{worker.workerName}</span>
                      {isOverloaded && <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950">{worker.totalTasks}</span>
                      <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full transition-all ${isOverloaded ? "bg-yellow-500" : "bg-blue-600"}`} style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {overloadedWorkers.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-700" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Khối lượng chưa cân bằng</p>
                  <p className="mt-1 text-xs text-yellow-800">{overloadedWorkers.length} nhân viên đang có nhiều việc hơn mức trung bình.</p>
                </div>
              </div>
            </div>
          )}

          {availableWorkers > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 text-blue-700" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Có thể phân công thêm</p>
                  <p className="mt-1 text-xs text-blue-800">{availableWorkers} nhân viên chưa có trong nhóm đang hoạt động.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
