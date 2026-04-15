import { api } from "./api";

// Interface dựa trên response data thực tế
export interface IssueReport {
  id: string;
  taskAssignmentId: string;
  reportedByWorkerId: string;
  reportedByWorkerName: string;
  description: string;
  status: string;
  resolvedByWorkerId: string | null;
  resolvedAt: string | null;
  created: string;
  lastModified: string;
}

// Response structure từ API
export interface IssueReportsResponse {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  content: IssueReport[];
}

export interface IssueReportsPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
}

// Get paginated issue reports
export async function getIssueReportsPaginated(
  params: IssueReportsPaginatedRequest = {},
): Promise<IssueReportsResponse> {
  const queryParams: Record<string, string> = {};

  if (params.pageNumber) queryParams.pageNumber = params.pageNumber.toString();
  if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

  return api.get<IssueReportsResponse>("/IssueReports", {
    params: queryParams,
  });
}

// Resolve issue report (approve or reject)
export async function resolveIssueReport(
  id: string,
  status: "Rejected" | "Approved",
): Promise<IssueReport> {
  return api.patch<IssueReport>(`/IssueReports/${id}/resolve`, {
    status,
  });
}
