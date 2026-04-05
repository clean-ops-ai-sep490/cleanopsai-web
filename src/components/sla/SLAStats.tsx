"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Clock, Users, CheckCircle } from "lucide-react";
import { getSLAs } from "@/lib/sla-api";

interface SLAStatsProps {
  className?: string;
}

export function SLAStats({ className }: SLAStatsProps) {
  const [stats, setStats] = useState({
    totalSLAs: 0,
    activeSLAs: 0,
    totalShifts: 0,
    totalTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const slas = await getSLAs();
      // Ensure slas is an array before processing
      const slasArray = Array.isArray(slas) ? slas : [];
      setStats({
        totalSLAs: slasArray.length,
        activeSLAs: slasArray.length, // All SLAs are considered active for now
        totalShifts: 0, // Would need to aggregate from shifts API
        totalTasks: 0, // Would need to aggregate from tasks API
      });
    } catch (error) {
      console.error("Failed to load SLA stats:", error);
      // Set default stats on error
      setStats({
        totalSLAs: 0,
        activeSLAs: 0,
        totalShifts: 0,
        totalTasks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Tổng SLA",
      value: loading ? "..." : stats.totalSLAs.toString(),
      icon: Building,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "SLA Hoạt động",
      value: loading ? "..." : stats.activeSLAs.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Ca làm việc",
      value: loading ? "..." : stats.totalShifts.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Công việc",
      value: loading ? "..." : stats.totalTasks.toString(),
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
