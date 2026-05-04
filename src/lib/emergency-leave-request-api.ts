import { api } from "./api";
import {
  parsePaginatedResponse,
  type PaginatedResponse,
} from "./api-response-parser";
import type { PaginatedRequest } from "@/types/common";

export type EmergencyLeaveRequestStatus = "Pending" | "Approved" | "Rejected";

export interface EmergencyLeaveRequest {
  id: string;
  workerId: string;
  workerName: string;
  taskAssignmentId: string | null;
  leaveDateFrom: string;
  leaveDateTo: string;
  audioUrl: string | null;
  transcription: string | null;
  status: EmergencyLeaveRequestStatus;
  reviewedByUserId: string | null;
  reviewedByUserName: string | null;
  approvedAt: string | null;
  created: string;
  lastModified: string;
}

export interface EmergencyLeaveRequestsPaginatedRequest extends PaginatedRequest {
  status?: EmergencyLeaveRequestStatus;
  workerId?: string;
}

export async function getEmergencyLeaveRequestsPaginated(
  params: EmergencyLeaveRequestsPaginatedRequest = {},
): Promise<PaginatedResponse<EmergencyLeaveRequest>> {
  const { pageNumber = 1, pageSize = 10, status, workerId } = params;

  const queryParams = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  if (status) queryParams.append("status", status);
  if (workerId) queryParams.append("workerId", workerId);

  const response = await api.get<unknown>(
    `/EmergencyLeaveRequests?${queryParams.toString()}`,
  );

  return parsePaginatedResponse<EmergencyLeaveRequest>(
    response,
    pageNumber,
    pageSize,
  );
}

export async function reviewEmergencyLeaveRequest(
  id: string,
  data: {
    status: Extract<EmergencyLeaveRequestStatus, "Approved" | "Rejected">;
  },
): Promise<EmergencyLeaveRequest> {
  return api.patch<EmergencyLeaveRequest>(
    `/EmergencyLeaveRequests/${id}/review`,
    data,
  );
}
