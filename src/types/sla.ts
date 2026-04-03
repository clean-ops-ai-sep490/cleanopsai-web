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
  contractNumber: string;
  serviceType: string;
  slaName: string;
  environment: string;
}

export interface SLAStaffRequirement {
  position: string;
  quantity: number;
  workTime: string;
}

export interface SLACreationData {
  basicInfo: SLABasicInfo;
  zones: Zone[];
  workAreas: WorkArea[];
  staffRequirements: SLAStaffRequirement[];
}
