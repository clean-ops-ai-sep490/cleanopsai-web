"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle, CheckCircle2, CircleDashed, TrendingUp } from "lucide-react";
import type { DashboardMetrics, TaskStatusCount } from "@/types/dashboard";

interface TaskCompletionChartProps {
  taskStatusCounts: TaskStatusCount[];
  metrics: DashboardMetrics;
}

const statusConfig = {
  Completed: { label: "Đã hoàn thành", color: "#22c55e" },
  InProgress: { label: "Đang thực hiện", color: "#3b82f6" },
  NotStarted: { label: "Chưa bắt đầu", color: "#f59e0b" },
  Block: { label: "Bị chặn", color: "#ef4444" },
};

export function TaskCompletionChart({ taskStatusCounts, metrics }: TaskCompletionChartProps) {
  const totalTasks = taskStatusCounts.reduce((sum, status) => sum + status.totalTasks, 0);
  const statusData = taskStatusCounts.map((status) => ({
    ...status,
    config: statusConfig[status.status],
    percentage: totalTasks > 0 ? (status.totalTasks / totalTasks) * 100 : 0,
  }));

  let chartOffset = 25;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Hoàn thành công việc</CardTitle>
            <CardDescription>Theo dõi trạng thái công việc và điểm cần xử lý.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-blue-200 text-blue-700">
            <TrendingUp className="h-3 w-3" /> Hiệu suất {metrics.efficiencyScore.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {totalTasks === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu công việc"
            description="Biểu đồ sẽ xuất hiện khi hệ thống có task để phân tích."
            icon={<CircleDashed className="h-10 w-10" />}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
            <div className="relative mx-auto h-60 w-60">
              <svg className="h-60 w-60 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                {statusData.map((status) => {
                  const circle = (
                    <circle
                      key={status.status}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={status.config.color}
                      strokeDasharray={`${status.percentage} ${100 - status.percentage}`}
                      strokeDashoffset={chartOffset}
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  );
                  chartOffset -= status.percentage;
                  return circle;
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{metrics.completionRate.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">hoàn thành</p>
              </div>
            </div>

            <div className="space-y-3">
              {statusData.map((status) => (
                <div key={status.status} className="rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.config.color }} />
                      <span className="text-sm font-medium text-slate-900">{status.config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-950">{status.totalTasks}</span>
                      <Badge variant="outline">{status.percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
              ))}

              {metrics.blockedTasksCount > 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{metrics.blockedTasksCount} công việc đang bị chặn cần xử lý sớm.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Không có công việc bị chặn trong dữ liệu hiện tại.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
