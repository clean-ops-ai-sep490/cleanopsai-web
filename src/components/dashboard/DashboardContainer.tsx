"use client";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, calculateDashboardMetrics } from "@/hooks/useDashboard";
import { TaskCompletionChart } from "./TaskCompletionChart";
import { WorkerProductivityChart } from "./WorkerProductivityChart";
import { AlertsPanel } from "./AlertsPanel";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { BarChart3, CalendarDays, ShieldAlert, Users } from "lucide-react";
import { StatsCard } from "../ui/stats-card";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[var(--radius-md)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="border border-slate-200/80 bg-white/90">
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Skeleton className="h-[420px] rounded-[var(--radius-lg)] xl:col-span-7" />
        <Skeleton className="h-[420px] rounded-[var(--radius-lg)] xl:col-span-5" />
      </div>

      <Skeleton className="h-[340px] rounded-[var(--radius-lg)]" />
    </div>
  );
}

export function DashboardContainer() {
  const { data, isLoading, error, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Bảng điều khiển Quản lý
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan hoạt động, hiệu suất và cảnh báo vận hành.
          </p>
        </div>

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
  const totalTasks = data.taskStatusCounts.reduce(
    (sum, status) => sum + status.totalTasks,
    0,
  );
  const nextTasks = Math.max(
    data.taskSummary.totalTasksToDate - data.taskSummary.passedTasksToDate,
    0,
  );
  const riskLevel =
    metrics.blockedTasksCount > 0
      ? "Cao"
      : metrics.workerUtilization < 40
        ? "Trung bình"
        : "Thấp";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="Tổng quan" />
            <StatusBadge status={`Rủi ro ${riskLevel}`} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Bảng điều khiển Quản lý
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tóm tắt ưu tiên vận hành để nhìn nhanh và quyết định nhanh.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-fit"
        >
          <RefreshCw className={isRefetching ? "animate-spin" : undefined} />
          {isRefetching ? "Đang làm mới" : "Làm mới"}
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Công việc hôm nay"
          value={data.taskSummary.totalTasksToDate}
          helper={`${data.taskSummary.passedTasksToDate} hoàn thành · ${data.taskSummary.nonPassedTasksToDate} đang chờ`}
          icon={<BarChart3 className="h-5 w-5" />}
          tone="info"
        />
        <StatsCard
          label="Tuân thủ AI"
          value={`${data.aiComplianceRate.passedPercentage}%`}
          helper={`${data.aiComplianceRate.passedChecks}/${data.aiComplianceRate.totalAutomatedEvaluatedChecks} kiểm tra đạt`}
          icon={<ShieldAlert className="h-5 w-5" />}
          tone="success"
        />
        <StatsCard
          label="Khu vực hoạt động"
          value={metrics.activeWorkAreas}
          helper={`${data.workAreaStats.reduce((sum, area) => sum + area.totalTasks, 0)} tổng công việc`}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="warning"
        />
        <StatsCard
          label="Sử dụng nhân lực"
          value={`${metrics.workerUtilization.toFixed(1)}%`}
          helper={`${data.topWorkers.length}/${data.workerTotal.totalWorkers} nhân viên đang hoạt động`}
          icon={<Users className="h-5 w-5" />}
          tone="default"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <TaskCompletionChart
            taskStatusCounts={data.taskStatusCounts}
            metrics={metrics}
          />
        </div>

        <div className="xl:col-span-5">
          <SectionCard
            title="Ưu tiên hôm nay"
            description="Những chỉ số cần chú ý ngay trước khi đi sâu vào chi tiết."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatsCard
                label="Nhiệm vụ gần hạn"
                value={nextTasks}
                helper="Số nhiệm vụ còn đang trong luồng xử lý"
                tone="warning"
              />
              <StatsCard
                label="Nhiệm vụ bị chặn"
                value={metrics.blockedTasksCount}
                helper="Cần kiểm tra và xử lý sớm"
                tone="danger"
              />
              <StatsCard
                label="Điểm hiệu suất"
                value={`${metrics.efficiencyScore.toFixed(1)}%`}
                helper="Chỉ số tổng quan của vận hành"
                tone="success"
              />
              <StatsCard
                label="Tổng nhiệm vụ"
                value={totalTasks}
                helper="Tổng số nhiệm vụ theo trạng thái"
                tone="info"
              />
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <WorkerProductivityChart
            topWorkers={data.topWorkers}
            workerTotal={data.workerTotal}
            metrics={metrics}
          />
        </div>

        <div className="xl:col-span-5">
          <SectionCard
            title="Rủi ro SLA"
            description="Tóm tắt rủi ro vận hành dựa trên công việc chặn và mức sử dụng nhân lực."
          >
            <div className="space-y-4">
              <div className="rounded-[var(--radius-md)] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-medium text-slate-500">Mức độ rủi ro</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {riskLevel}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {metrics.blockedTasksCount > 0
                    ? "Có nhiệm vụ bị chặn nên cần theo dõi sát."
                    : metrics.workerUtilization < 40
                      ? "Nhân lực đang dư, cần phân bổ lại nếu có công việc mới."
                      : "Tình hình hiện tại đang ổn định."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <StatsCard
                  label="Tỷ lệ hoàn thành"
                  value={`${metrics.completionRate.toFixed(1)}%`}
                  helper="Tỷ lệ công việc hoàn thành so với tổng số"
                  tone="success"
                />
                <StatsCard
                  label="Nhân lực khả dụng"
                  value={Math.max(data.workerTotal.totalWorkers - data.topWorkers.length, 0)}
                  helper="Số nhân viên chưa nằm trong nhóm đang hoạt động"
                  tone="info"
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </section>

      <section>
        <AlertsPanel data={data} metrics={metrics} />
      </section>
    </div>
  );
}
