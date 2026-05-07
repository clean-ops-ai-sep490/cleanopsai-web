"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CircleDashed, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import type { DashboardData, DashboardMetrics } from "@/types/dashboard";

interface TaskCompletionChartProps {
  data: DashboardData;
  metrics: DashboardMetrics;
}

export function TaskCompletionChart({ data, metrics }: TaskCompletionChartProps) {
  const { taskSummary } = data;
  const total = taskSummary.totalTasksToDate;
  
  const passedPercentage = total > 0 ? (taskSummary.passedTasksToDate / total) * 100 : 0;
  const nonPassedPercentage = total > 0 ? (taskSummary.nonPassedTasksToDate / total) * 100 : 0;

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Tiến độ công việc</CardTitle>
            <CardDescription className="text-sm text-slate-500">Tỷ lệ hoàn thành công việc trong ngày.</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
            <TrendingUp className="mr-1 h-3 w-3" />
            {metrics.completionRate.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {total === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu"
            description="Số liệu sẽ hiển thị khi có công việc được ghi nhận."
            icon={<CircleDashed className="h-10 w-10 text-slate-300" />}
          />
        ) : (
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-around">
            <div className="relative h-48 w-48">
              <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#3b82f6"
                  strokeDasharray={`${passedPercentage * 2.64} 264`}
                  strokeLinecap="round"
                  strokeWidth="12"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold tracking-tight text-slate-900">{metrics.completionRate.toFixed(0)}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hoàn thành</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[180px]">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Đã đạt</p>
                    <p className="text-sm font-bold text-slate-900">{taskSummary.passedTasksToDate}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-100 text-blue-600">{passedPercentage.toFixed(0)}%</Badge>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <Clock className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Chưa đạt</p>
                    <p className="text-sm font-bold text-slate-900">{taskSummary.nonPassedTasksToDate}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-slate-100 text-slate-500">{nonPassedPercentage.toFixed(0)}%</Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
