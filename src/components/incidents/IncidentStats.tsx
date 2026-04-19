import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Siren,
  ClipboardPlus,
  CheckCircle2,
} from "lucide-react";

interface IncidentStatsProps {
  openIssues: number;
  activeEmergencies: number;
  pendingRequests: number;
  resolvedThisMonth: number;
}

export function IncidentStats({
  openIssues,
  activeEmergencies,
  pendingRequests,
  resolvedThisMonth,
}: IncidentStatsProps) {
  const stats = [
    {
      label: "Issue đang mở",
      value: openIssues,
      color: "text-yellow-600",
      icon: AlertTriangle,
    },
    {
      label: "Emergency active",
      value: activeEmergencies,
      color: activeEmergencies > 0 ? "text-red-600" : "text-green-600",
      icon: Siren,
    },
    {
      label: "Yêu cầu chờ duyệt",
      value: pendingRequests,
      color: "text-blue-600",
      icon: ClipboardPlus,
    },
    {
      label: "Đã xử lý tháng này",
      value: resolvedThisMonth,
      color: "text-green-600",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border rounded-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
