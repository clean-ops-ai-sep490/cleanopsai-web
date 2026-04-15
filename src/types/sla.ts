// SLA API Types based on backend endpoints
export interface SLA {
  id: string;
  name: string;
  description?: string;
  environmentTypeId: string;
  serviceType: "Cleaning";
  workAreaId: string;
  contractId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSLAData {
  name: string;
  description?: string;
  environmentTypeId: string;
  serviceType: "Cleaning";
  workAreaId: string;
  contractId: string;
}

export interface SLAShift {
  id: string;
  name: string;
  slaId: string;
  startTime: string;
  endTime: string;
  requiredWorker: number;
  breakTime: number;
  createdAt?: string;
}

export interface CreateSLAShiftData {
  name: string;
  slaId: string;
  startTime: string;
  endTime: string;
  requiredWorker: number;
  breakTime: number;
}

export interface SLATask {
  id: string;
  name: string;
  slaId: string;
  recurrenceType: "Daily" | "Weekly" | "Monthly" | "Yearly";
  recurrenceConfig: {
    interval: number;
    daysOfWeek?: (
      | "Sunday"
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
    )[];
    daysOfMonth?: number[];
    monthDays?: { month: number; day: number }[];
  };
  createdAt?: string;
}

export interface CreateSLATaskData {
  name: string;
  slaId: string;
  recurrenceType: "Daily" | "Weekly" | "Monthly" | "Yearly";
  recurrenceConfig: {
    interval: number;
    daysOfWeek?: (
      | "Sunday"
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
    )[];
    daysOfMonth?: number[];
    monthDays?: { month: number; day: number }[];
  };
}

// Legacy types for backward compatibility (will be removed)
export interface SLATrigger {
  id: string;
  name: string;
  type: string;
  condition: string;
  threshold: number;
  unit: string;
  status: "active" | "inactive";
  createdAt: string;
}

export type CreateSLATriggerData = Omit<
  SLATrigger,
  "id" | "status" | "createdAt"
>;

// Zone and Work Area types
export interface Zone {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface WorkAreaTask {
  id: string;
  name: string;
  frequency: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    yearly: boolean;
    note?: string;
  };
}

export interface WorkArea {
  id: string;
  name: string;
  zoneId: string;
  area: number; // diện tích (m²)
  description?: string;
  tasks: WorkAreaTask[]; // tasks specific to this work area
  createdAt: string;
}

// SLA Creation Flow types
export interface SLABasicInfo {
  contractId: string;
  environmentTypeId: string;
  slaName: string;
  locationId: string;
  zoneId: string;
  workAreaId: string;
}

export interface SLAStaffRequirement {
  name: string;
  startTime: string;
  endTime: string;
  requiredWorker: number;
  breakTime: number;
}

export interface SLATaskRequirement {
  name: string;
  recurrenceType: "Daily" | "Weekly" | "Monthly" | "Yearly";
  recurrenceConfig: {
    interval: number;
    daysOfWeek?: string[];
    daysOfMonth?: number[];
    selectedMonth?: number; // For Yearly recurrence
    monthDays?: { month: number; day: number }[];
  };
}

export interface SLACreationData {
  basicInfo: SLABasicInfo;
  staffRequirements: SLAStaffRequirement[];
  taskRequirements: SLATaskRequirement[];
}
