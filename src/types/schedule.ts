/**
 * Task Schedule and Workflow Frequency related types
 * Based on API specification and product requirements
 */

// Workflow frequency enum
export enum WorkflowFrequency {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Quarterly = "Quarterly",
  Yearly = "Yearly",
  OnDemand = "OnDemand",
}

// Task Schedule types
export interface TaskSchedule {
  id: string;
  sopId: string;
  slaId: string;
  slaTaskId: string;
  slaShiftId: string;
  workAreaId: string;
  workAreaDetailId: string;
  name: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  displayLocation: string;
  durationMinutes: number;
  recurrenceType: string; // e.g., "Daily"
  recurrenceConfig: RecurrenceConfig;
  contractStartDate: string; // date format "2026-04-10"
  contractEndDate: string; // date format "2026-04-10"
  isActive: boolean;
  metadata?: TaskScheduleStep[];
  lastGeneratedToDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskScheduleStep {
  Id: string;
  SopId: string;
  StepId: string;
  StepOrder: number;
  ConfigDetail: string; // JSON string
  Created: string;
  CreatedBy: string;
  IsDeleted: boolean;
  LastModified: string;
  LastModifiedBy: string | null;
  Sop?: any;
  Step?: any;
}

// Recurrence configuration
export interface RecurrenceConfig {
  times: string[]; // Format: "HH:MM:SS" (24-hour format)
  daysOfWeek?: string[]; // Weekday names: Sunday..Saturday
  daysOfMonth?: number[];
  monthDays?: MonthDay[];
}

export interface MonthDay {
  month: number;
  day: number;
}

// Task Schedule CRUD types
export interface CreateTaskScheduleData {
  sopId: string;
  slaTaskId: string;
  slaShiftId: string;
  workAreaId: string;
  workAreaDetailId: string;
  name: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  displayLocation: string;
  durationMinutes: number;
  recurrenceType: string; // e.g., "Daily"
  recurrenceConfig: RecurrenceConfig;
  contractStartDate: string; // date format "2026-04-07"
  contractEndDate: string; // date format "2026-04-07"
  isActive: boolean;
}

export interface UpdateTaskScheduleData extends Partial<CreateTaskScheduleData> {}
