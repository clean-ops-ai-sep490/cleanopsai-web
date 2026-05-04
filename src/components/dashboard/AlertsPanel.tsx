"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Lightbulb,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardData, DashboardMetrics } from "@/types/dashboard";

interface AlertsPanelProps {
  data: DashboardData;
  metrics: DashboardMetrics;
}

export function AlertsPanel({ data, metrics }: AlertsPanelProps) {
  const alerts = [];
  const recommendations = [];

  if (metrics.blockedTasksCount > 0) {
    alerts.push({
      title: "Công việc bị chặn",
      message: `${metrics.blockedTasksCount} công việc cần được xử lý sớm.`,
      priority: "Cao",
      icon: AlertTriangle,
      className: "border-red-200 bg-red-50 text-red-800",
    });
  }

  const totalAssignedTasks = data.topWorkers.reduce(
    (sum, worker) => sum + worker.totalTasks,
    0,
  );
  const avgTasks =
    data.topWorkers.length > 0 ? totalAssignedTasks / data.topWorkers.length : 0;
  const overloadedWorkers = data.topWorkers.filter(
    (worker) => avgTasks > 0 && worker.totalTasks > avgTasks * 2,
  );
  const availableWorkers = Math.max(
    data.workerTotal.totalWorkers - data.topWorkers.length,
    0,
  );

  if (overloadedWorkers.length > 0) {
    alerts.push({
      title: "Khối lượng công việc chưa cân bằng",
      message: `${overloadedWorkers[0].workerName} đang có ${overloadedWorkers[0].totalTasks} công việc.`,
      priority: "Vừa",
      icon: Users,
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    });
  }

  if (metrics.workerUtilization < 30) {
    alerts.push({
      title: "Tỷ lệ sử dụng nhân lực thấp",
      message: `Chỉ ${metrics.workerUtilization.toFixed(1)}% nhân viên đang hoạt động.`,
      priority: "Thấp",
      icon: Users,
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  }

  if (availableWorkers > 0) {
    recommendations.push({
      title: "Nhân lực sẵn sàng",
      message: `${availableWorkers} nhân viên có thể được phân công thêm.`,
      icon: Users,
    });
  }

  if (overloadedWorkers.length > 0 && availableWorkers > 0) {
    recommendations.push({
      title: "Cân bằng phân công",
      message: `Có thể chuyển bớt khoảng ${Math.ceil(avgTasks)} công việc sang nhân viên khác.`,
      icon: TrendingUp,
    });
  }

  if (data.aiComplianceRate.passedPercentage === 100) {
    recommendations.push({
      title: "Chất lượng đang tốt",
      message: "Tỷ lệ tuân thủ AI đạt 100%, nên tiếp tục duy trì quy trình hiện tại.",
      icon: CheckCircle2,
    });
  }

  if (metrics.efficiencyScore > 80) {
    recommendations.push({
      title: "Hiệu suất cao",
      message: `Điểm hiệu suất ${metrics.efficiencyScore.toFixed(1)}% cho thấy vận hành ổn định.`,
      icon: TrendingUp,
    });
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Cảnh báo và đề xuất</CardTitle>
            <CardDescription>
              Tóm tắt các vấn đề cần chú ý và gợi ý tối ưu vận hành.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-gray-200 text-gray-600">
              <Clock className="h-3 w-3" />
              Cập nhật tự động
            </Badge>
            {alerts.length > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3" />
                {alerts.length} cảnh báo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-950">
                Cảnh báo hoạt động
              </h3>
              <span className="text-sm text-gray-500">{alerts.length} mục</span>
            </div>

            {alerts.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  Hệ thống đang hoạt động bình thường
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Chưa phát hiện cảnh báo cần xử lý.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = alert.icon;

                  return (
                    <div
                      key={alert.title}
                      className={`rounded-lg border p-3 transition hover:shadow-sm ${alert.className}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{alert.title}</p>
                          <p className="mt-1 text-xs leading-5">
                            {alert.message}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-white/70">
                          {alert.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-950">
                Đề xuất cải thiện
              </h3>
              <span className="text-sm text-gray-500">
                {recommendations.length} mục
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                <Lightbulb className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">
                  Chưa có đề xuất mới
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Gợi ý sẽ xuất hiện khi dữ liệu có điểm cần tối ưu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const Icon = rec.icon;

                  return (
                    <div
                      key={rec.title}
                      className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-900 transition hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                        <div>
                          <p className="text-sm font-semibold">{rec.title}</p>
                          <p className="mt-1 text-xs leading-5 text-blue-800">
                            {rec.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary gives managers a quick scan without opening another page. */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Tổng quan nhanh
                  </p>
                  <div className="mt-2 grid gap-1 text-xs leading-5 text-gray-600">
                    <span>{metrics.activeWorkAreas} khu vực hoạt động</span>
                    <span>{data.taskSummary.totalTasksToDate} công việc hôm nay</span>
                    <span>{metrics.efficiencyScore.toFixed(1)}% hiệu suất</span>
                    <span>{data.aiComplianceRate.passedPercentage}% tuân thủ AI</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
