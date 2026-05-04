"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle, ClipboardList, Users } from "lucide-react";
import type { DashboardData, DashboardMetrics } from "@/types/dashboard";

interface MetricsCardsProps {
  data: DashboardData;
  metrics: DashboardMetrics;
}

export function MetricsCards({ data, metrics }: MetricsCardsProps) {
  const totalWorkAreaTasks = data.workAreaStats.reduce(
    (sum, area) => sum + area.totalTasks,
    0,
  );

  // Keep every card in the same structure so students can edit labels easily.
  const cards = [
    {
      title: "Công việc hôm nay",
      value: data.taskSummary.totalTasksToDate,
      subtitle: `${data.taskSummary.passedTasksToDate} hoàn thành, ${data.taskSummary.nonPassedTasksToDate} đang chờ`,
      icon: ClipboardList,
      color: "blue",
      badge: "Daily",
    },
    {
      title: "Tuân thủ AI",
      value: `${data.aiComplianceRate.passedPercentage}%`,
      subtitle: `${data.aiComplianceRate.passedChecks}/${data.aiComplianceRate.totalAutomatedEvaluatedChecks} kiểm tra đạt`,
      icon: CheckCircle,
      color: "green",
      badge: "Quality",
    },
    {
      title: "Khu vực hoạt động",
      value: metrics.activeWorkAreas,
      subtitle: `${totalWorkAreaTasks} tổng công việc`,
      icon: Building2,
      color: "yellow",
      badge: "Sites",
    },
    {
      title: "Sử dụng nhân lực",
      value: `${metrics.workerUtilization.toFixed(1)}%`,
      subtitle: `${data.topWorkers.length}/${data.workerTotal.totalWorkers} nhân viên đang hoạt động`,
      icon: Users,
      color: "red",
      badge: "Staff",
    },
  ];

  const colorClasses = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    yellow: "border-yellow-100 bg-yellow-50 text-yellow-700",
    red: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const colorClass =
          colorClasses[card.color as keyof typeof colorClasses];

        return (
          <Card
            key={card.title}
            className="border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-lg border p-2.5 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-gray-500">
                  {card.badge}
                </Badge>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-5 text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
