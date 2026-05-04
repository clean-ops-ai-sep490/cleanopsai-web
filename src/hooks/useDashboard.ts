/**
 * Dashboard data hook
 */

import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/dashboard-api";
import type { DashboardData, DashboardMetrics } from "@/types/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Calculate dashboard metrics from raw data
export function calculateDashboardMetrics(
  data: DashboardData,
): DashboardMetrics {
  const { taskStatusCounts, topWorkers, workerTotal, workAreaStats } = data;

  // Calculate total tasks
  const totalTasks = taskStatusCounts.reduce(
    (sum, status) => sum + status.totalTasks,
    0,
  );

  // Find specific status counts
  const completedTasks =
    taskStatusCounts.find((s) => s.status === "Completed")?.totalTasks || 0;
  const inProgressTasks =
    taskStatusCounts.find((s) => s.status === "InProgress")?.totalTasks || 0;
  const blockedTasks =
    taskStatusCounts.find((s) => s.status === "Block")?.totalTasks || 0;

  // Calculate metrics
  const efficiencyScore =
    totalTasks > 0
      ? ((completedTasks + inProgressTasks) / totalTasks) * 100
      : 0;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Worker utilization (active workers / total workers)
  const activeWorkers = topWorkers.length;
  const workerUtilization =
    workerTotal.totalWorkers > 0
      ? (activeWorkers / workerTotal.totalWorkers) * 100
      : 0;

  // Active work areas (areas with tasks > 0)
  const activeWorkAreas = workAreaStats.filter(
    (area) => area.totalTasks > 0,
  ).length;

  return {
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    workerUtilization: Math.round(workerUtilization * 100) / 100,
    blockedTasksCount: blockedTasks,
    activeWorkAreas,
  };
}
