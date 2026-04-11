/**
 * Skill and Certification related types
 * Based on API specification and product requirements
 */

import type { SkillLevel } from "./common";

// Skill types
export interface Skill {
  id: string;
  name: string;
  description?: string;
  category: string;
  level: SkillLevel;
  requiresCertification: boolean;
  certificationExpiryMonths?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillData {
  name: string;
  category: string;
  description: string;
}

export interface UpdateSkillData extends Partial<CreateSkillData> {}

// Certification types
export interface Certification {
  id: string;
  name: string;
  description?: string;
  issuingOrganization: string;
  validityMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificationData {
  name: string;
  category: string;
  issuingOrganization: string;
}

export interface UpdateCertificationData extends Partial<CreateCertificationData> {}

// Worker Skill types
export interface WorkerSkill {
  id: string;
  workerId: string;
  skillId: string;
  level: SkillLevel;
  certifiedAt?: string;
  certificationExpiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  skill?: Skill;
}

export interface CreateWorkerSkillData {
  workerId: string;
  skillId: string;
  skillLevel: string; // e.g., "Beginner"
}

export interface UpdateWorkerSkillData extends Partial<CreateWorkerSkillData> {}

// Worker Certification types
export interface WorkerCertification {
  id: string;
  workerId: string;
  certificationId: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  certification?: Certification;
}
