/**
 * Dashboard API functions
 */

import { api } from "./api";
import type {
  TaskSummary,
  TaskStatusCount,
  TopWorker,
  WorkerTotal,
  WorkAreaStat,
  AIComplianceRate,
  DashboardData,
} from "@/types/dashboard";

// Individual API calls
export const getDashboardTaskSummary = (): Promise<TaskSummary> =>
  api.get<TaskSummary>("/dashboard/task-summary");

export const getDashboardTaskStatusCounts = (): Promise<TaskStatusCount[]> =>
  api.get<TaskStatusCount[]>("/dashboard/task-status-counts");

export const getDashboardTopWorkers = (): Promise<TopWorker[]> =>
  api.get<TopWorker[]>("/dashboard/top-workers");

export const getDashboardWorkerTotal = (): Promise<WorkerTotal> =>
  api.get<WorkerTotal>("/dashboard/worker-total");

export const getDashboardWorkAreaStats = (): Promise<WorkAreaStat[]> =>
  api.get<WorkAreaStat[]>("/dashboard/work-area-stats");

export const getDashboardAIComplianceRate = (): Promise<AIComplianceRate> =>
  api.get<AIComplianceRate>("/dashboard/ai-compliance-rate");

// Combined dashboard data fetch
export const getDashboardData = async (): Promise<DashboardData> => {
  const [
    taskSummary,
    taskStatusCounts,
    topWorkers,
    workerTotal,
    workAreaStats,
    aiComplianceRate,
  ] = await Promise.all([
    getDashboardTaskSummary(),
    getDashboardTaskStatusCounts(),
    getDashboardTopWorkers(),
    getDashboardWorkerTotal(),
    getDashboardWorkAreaStats(),
    getDashboardAIComplianceRate(),
  ]);

  return {
    taskSummary,
    taskStatusCounts,
    topWorkers,
    workerTotal,
    workAreaStats,
    aiComplianceRate,
  };
};
