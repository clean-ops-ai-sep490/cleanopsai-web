"use client";

import { AlertCircle, BarChart3, ShieldAlert, CalendarDays, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, calculateDashboardMetrics } from "@/hooks/useDashboard";
import { TaskCompletionChart } from "./TaskCompletionChart";
import { MetricsCards } from "./MetricsCards";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { WorkerListCard } from "./WorkerListCard";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-32 rounded-2xl border border-slate-100 bg-white p-5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-24 mt-4" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Skeleton className="h-[420px] rounded-2xl xl:col-span-7" />
        <Skeleton className="h-[420px] rounded-2xl xl:col-span-5" />
      </div>
    </div>
  );
}

export function DashboardContainer() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Bảng điều khiển" 
          description="Tổng quan hoạt động, hiệu suất và cảnh báo vận hành." 
        />
        <ErrorState
          title="Không thể tải dashboard"
          description="Vui lòng kiểm tra kết nối hoặc thử tải lại dữ liệu."
          onAction={() => refetch()}
          icon={<AlertCircle className="h-8 w-8" />}
        />
      </div>
    );
  }

  const metrics = calculateDashboardMetrics(data);
  const riskLevel = metrics.blockedTasksCount > 0 ? "Cao" : metrics.workerUtilization < 40 ? "Trung bình" : "Thấp";

  // Sort workers for Top list
  const topPerformers = [...data.topWorkers]
    .sort((a, b) => b.totalTasks - a.totalTasks)
    .slice(0, 8);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">        
        <PageHeader
          title="Bảng điều khiển"
          description="Tổng quan tình hình vận hành và hiệu suất làm việc."
        />
      </div>

      {/* 4 Task Status Metrics */}
      <section>
        <MetricsCards data={data} />
      </section>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <TaskCompletionChart data={data} metrics={metrics} />
        </div>

        <div className="xl:col-span-5">
          <WorkerListCard workers={topPerformers} />
        </div>
      </section>
    </div>
  );
}
