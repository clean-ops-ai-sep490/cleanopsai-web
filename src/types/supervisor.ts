/**
 * Supervisor types for work area assignment
 */

export interface Supervisor {
  id: string;
  fullName: string;
  email: string;
  status: string | null;
  role: string;
}

export interface CreateSupervisorData {
  userId: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  hireDate?: string;
}

export interface UpdateSupervisorData {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  hireDate?: string;
  status?: string | null;
}

// Work Area Supervisor Assignment
export interface WorkAreaSupervisorAssignment {
  id: string;
  workAreaId: string;
  workAreaName: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  assignedAt: string;
  isActive: boolean;
}

export interface AssignSupervisorToWorkAreaData {
  workAreaId: string;
  supervisorId: string;
  workerIds: string[];
}

export interface UnassignSupervisorFromWorkAreaData {
  workAreaId: string;
  supervisorId: string;
}
