import { api } from "./api";

// Types for work area supervisor assignment
export interface WorkAreaSupervisorAssignRequest {
  workAreaId: string;
  supervisorId: string;
  workerIds: string[];
}

export interface WorkAreaSupervisorAssignResponse {
  success: boolean;
  message?: string;
}

/**
 * Assign workers to supervisor in a specific work area
 * POST /api/WorkAreaSupervisors/assign
 */
export async function assignWorkersToSupervisor(
  request: WorkAreaSupervisorAssignRequest,
): Promise<WorkAreaSupervisorAssignResponse> {
  try {
    const response = await api.post<WorkAreaSupervisorAssignResponse>(
      "/WorkAreaSupervisors/assign",
      request,
    );
    return response;
  } catch (error) {
    console.error("Failed to assign workers to supervisor:", error);
    throw error;
  }
}

/**
 * Get supervisors assigned to a work area
 * GET /api/WorkAreaSupervisors?workAreaId={id}
 */
export async function getWorkAreaSupervisors(workAreaId: string) {
  try {
    const response = await api.get(
      `/WorkAreaSupervisors?workAreaId=${workAreaId}`,
    );
    return response;
  } catch (error) {
    console.error("Failed to get work area supervisors:", error);
    throw error;
  }
}

/**
 * Get workers assigned to a supervisor in a work area
 * GET /api/WorkAreaSupervisors/{supervisorId}/workers?workAreaId={workAreaId}
 */
export async function getSupervisorWorkers(
  supervisorId: string,
  workAreaId: string,
) {
  try {
    const response = await api.get(
      `/WorkAreaSupervisors/${supervisorId}/workers?workAreaId=${workAreaId}`,
    );
    return response;
  } catch (error) {
    console.error("Failed to get supervisor workers:", error);
    throw error;
  }
}
