/**
 * Standard Operating Procedure (SOP) and Step related types
 * Based on product requirements and future API implementation
 */

import type { SkillLevel } from "./common";

// SOP (Standard Operating Procedure) types
export interface SOP {
  id: string;
  name: string;
  description?: string;
  serviceType?: string;
  environmentTypeId: string;
  version: number;
  isActive?: boolean;
  isRequiredSkill?: boolean;
  isRequiredCertification?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  sopSteps?: SOPStep[]; // Changed from steps to sopSteps
  requiredSkillIds?: string[];
  requiredCertificationIds?: string[];
  environmentType?: any; // Can be null
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
  requiredSkillIds: string[];
  requiredCertificationIds: string[];
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
