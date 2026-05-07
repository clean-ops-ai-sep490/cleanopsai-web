/**
 * Standard Operating Procedure (SOP) and Step related types
 * Based on actual API response structure
 */

// SOP (Standard Operating Procedure) types
export interface SOP {
  id: string;
  name: string;
  description?: string;
  serviceType: string; // e.g., "Cleaning"
  environmentTypeId: string;
  version: number;
  requiredSkillIds?: string[] | null;
  requiredCertificationIds?: string[] | null;
  stepCount: number; // Number of steps in the SOP
  environmentType?: {
    id: string;
    name: string;
  } | null;
  sopSteps?: SOPStep[];
}

export interface SOPStep {
  id: string;
  sopId: string;
  stepId: string;
  stepOrder: number;
  configDetail: any;
}

export interface Step {
  id: string;
  actionKey: string; // ActionKey as string
  name: string;
  description: string;
  configSchema: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

// Create/Update types for SOP
export interface CreateSOPData {
  name: string;
  description?: string;
  serviceType: string; // e.g., "Cleaning"
  environmentTypeId: string;
  steps: SOPStepRequest[];
  requiredSkillIds?: string[];
  requiredCertificationIds?: string[];
}

export interface SOPStepRequest {
  stepId: string;
  stepOrder: number;
  configDetail: any; // JSON object, not string
}

export interface UpdateSOPData extends Partial<CreateSOPData> {}

// Step CRUD types
export interface CreateStepData {
  actionKey: string;
  name: string;
  description: string;
  configSchema: string;
}

export interface UpdateStepData extends Partial<CreateStepData> {}

// Environment Type for SOP
export interface EnvironmentType {
  id: string;
  name: string;
  description?: string;
  riskLevel: string; // RiskLevel enum as string
  requiredCertifications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentTypeData {
  name: string;
  description: string;
}

export interface UpdateEnvironmentTypeData extends Partial<CreateEnvironmentTypeData> {}
