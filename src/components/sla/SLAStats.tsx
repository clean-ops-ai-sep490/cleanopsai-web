"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SLAStatsProps {
  className?: string;
}

const statsData = [
  {
    title: "Active Triggers",
    value: "12",
    change: "+2",
    trend: "up",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Triggered Alerts",
    value: "8",
    change: "-3",
    trend: "down",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    title: "Response Time Avg",
    value: "24m",
    change: "+5m",
    trend: "up",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "SLA Compliance",
    value: "94.2%",
    change: "+1.2%",
    trend: "up",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

export function SLAStats({ className }: SLAStatsProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-black mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant="secondary"
                      className={`${
                        stat.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      } text-xs`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      vs last week
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
