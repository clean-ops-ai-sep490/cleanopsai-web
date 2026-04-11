"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building, Clock, Users, CheckCircle } from "lucide-react";
import { useSLAStats } from "@/hooks/useSLAStats";

interface SLAStatsProps {
  className?: string;
}

export function SLAStats({ className }: SLAStatsProps) {
  const { stats, isLoading } = useSLAStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white">
            <CardContent className="p-6 bg-white">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  const statsData = [
    {
      title: "Tổng SLA",
      value: stats.totalSLAs.toString(),
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "SLA Hoạt động",
      value: stats.activeSLAs.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Ca làm việc",
      value: stats.totalShifts.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Công việc",
      value: stats.totalTasks.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-white">
            <CardContent className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-black mt-1">
                    {stat.value}
                  </p>
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
