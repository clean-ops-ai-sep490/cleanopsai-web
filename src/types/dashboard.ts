/**
 * Dashboard data types based on API responses
 */

// Task Summary
export interface TaskSummary {
  totalTasksToDate: number;
  passedTasksToDate: number;
  nonPassedTasksToDate: number;
}

// Task Status Counts
export interface TaskStatusCount {
  status: "NotStarted" | "InProgress" | "Completed" | "Block";
  totalTasks: number;
}

// Top Workers
export interface TopWorker {
  workerId: string;
  workerName: string;
  totalTasks: number;
}

// Worker Total
export interface WorkerTotal {
  totalWorkers: number;
}

// Work Area Stats
export interface WorkAreaStat {
  workAreaId: string;
  workAreaName: string | null;
  displayLocation: string | null;
  totalWorkers: number;
  totalTasks: number;
}

// AI Compliance Rate
export interface AIComplianceRate {
  totalAutomatedEvaluatedChecks: number;
  passedChecks: number;
  failedChecks: number;
  passedPercentage: number;
  failedPercentage: number;
}

// Combined Dashboard Data
export interface DashboardData {
  taskSummary: TaskSummary;
  taskStatusCounts: TaskStatusCount[];
  topWorkers: TopWorker[];
  workerTotal: WorkerTotal;
  workAreaStats: WorkAreaStat[];
  aiComplianceRate: AIComplianceRate;
}

// Calculated metrics
export interface DashboardMetrics {
  efficiencyScore: number;
  completionRate: number;
  workerUtilization: number;
  blockedTasksCount: number;
  activeWorkAreas: number;
}
