import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, CircleDashed, Activity } from "lucide-react";
import type { DashboardData } from "@/types/dashboard";
import { StatusBadge } from "@/components/ui/status-badge";

interface MetricsCardsProps {
  data: DashboardData;
}

export function MetricsCards({ data }: MetricsCardsProps) {
  const { taskStatusCounts } = data;

  const getCount = (status: string) => 
    taskStatusCounts.find((s) => s.status === status)?.totalTasks || 0;

  const cards = [
    {
      title: "Chưa bắt đầu",
      value: getCount("NotStarted"),
      icon: CircleDashed,
      color: "slate",
      badge: "Đang chờ",
      variant: "default" as const,
    },
    {
      title: "Đang thực hiện",
      value: getCount("InProgress"),
      icon: Activity,
      color: "blue",
      badge: "Đang chạy",
      variant: "info" as const,
    },
    {
      title: "Đã hoàn thành",
      value: getCount("Completed"),
      icon: CheckCircle2,
      color: "green",
      badge: "Hoàn thành",
      variant: "success" as const,
    },
    {
      title: "Bị chặn",
      value: getCount("Block"),
      icon: AlertTriangle,
      color: "red",
      badge: "Bị chặn",
      variant: "error" as const,
    },
  ];

  const colorClasses = {
    slate: "border-slate-100 bg-slate-50 text-slate-600",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
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
            className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-xl border p-2.5 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <StatusBadge 
                  status={card.badge} 
                  variant={card.variant} 
                  className="px-2 py-0.5"
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
