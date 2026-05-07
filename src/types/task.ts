/**
 * Task Assignment and Task Execution related types
 * Based on actual API specification from cleanopsai-api-spec.json
 */

import type { PaginationParams } from "./common";

// Task Assignment Status and Type enums
export enum TaskAssignmentStatus {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum TaskType {
  Scheduled = "Scheduled", // Công việc theo lịch
  Adhoc = "Adhoc", // Công việc đột xuất
}

export enum StepExecutionStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Skipped = "Skipped",
}

// Action Keys for workflow steps (from API spec)
export enum ActionKey {
  CheckBox = "CheckBox",
  Photo = "Photo",
  Signature = "Signature",
  TextInput = "TextInput",
  Timer = "Timer",
  QRCode = "QRCode",
  Location = "Location",
}

// Task Assignment (from actual API spec)
export interface TaskAssignment {
  id: string;
  taskScheduleId?: string; // nullable
  assignedToWorkerId: string;
  workAreaId: string;
  scheduledDate: string; // date format
  scheduledStartTime: string; // time format
  scheduledEndTime: string; // time format
  actualStartTime?: string; // date-time, nullable
  actualEndTime?: string; // date-time, nullable
  status: TaskAssignmentStatus;
  taskType: TaskType;
  title: string;
  description: string;
  sopStepsMetadata: SopStepMetadata[];
}

// SOP Step Metadata (from actual API spec)
export interface SopStepMetadata {
  stepOrder: number;
  stepId: string;
  actionKey: string; // ActionKey enum values
  description: string;
  configSchema: object; // JSON configuration for this step
}

// Task Step Execution (from actual API spec)
export interface TaskStepExecution {
  id: string;
  taskAssignmentId: string;
  stepOrder: number;
  stepId: string;
  actionKey: string;
  description: string;
  status: StepExecutionStatus;
  resultData: object; // JSON result data
  startedAt?: string; // date-time, nullable
  completedAt?: string; // date-time, nullable
}

// Request types for Task Assignment
export interface CreateAdhocTaskData {
  assignedToWorkerId: string;
  workAreaId: string;
  title: string;
  description?: string;
  scheduledDate: string; // date format
  scheduledStartTime?: string; // time format
  scheduledEndTime?: string; // time format
}

export interface StartTaskData {
  workerId: string;
}

export interface CompleteTaskData {
  notes?: string;
}

export interface SubmitStepExecutionData {
  resultData: object; // Result data based on actionKey format
}

// Response types
export interface StartTaskResponse {
  taskAssignmentId: string;
  actualStartTime: string; // date-time
  currentStepExecution: TaskStepExecution;
}

// Task Assignment query parameters
export interface TaskAssignmentFilters extends PaginationParams {
  assignedToWorkerId?: string;
  workAreaId?: string;
  status?: TaskAssignmentStatus;
  taskType?: TaskType;
  fromDate?: string;
  toDate?: string;
}
