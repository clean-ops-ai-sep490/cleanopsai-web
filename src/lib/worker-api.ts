import { api } from "./api";
import {
  PaginatedResponse,
  parsePaginatedResponse,
} from "./api-response-parser";

// Worker types
export interface Worker {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  hireDate?: string;
  status?: "Active" | "Inactive" | "OnLeave";
  displayAddress?: string | null;
  avatarUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  totalSkills?: number;
  totalCertifications?: number;
}

// Extended worker type for filter responses with computed fields
export interface WorkerFilterResult extends Worker {
  displayAddress: string; // Always present in filter results
}

// Worker filter parameters based on API spec
export interface WorkerFilterParams {
  address?: string;
  skillCategories?: string[];
  certificateCategories?: string[];
  startAt?: string; // time format HH:MM:SS
  endAt?: string; // time format HH:MM:SS
  search?: string; // Search by name or other criteria
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Filter workers based on criteria
 * GET /api/Workers/filter
 */
export async function filterWorkers(
  params: WorkerFilterParams = {},
): Promise<PaginatedResponse<Worker>> {
  const queryParams = new URLSearchParams();

  if (params.address) queryParams.append("address", params.address);
  if (params.skillCategories?.length) {
    params.skillCategories.forEach((skill) =>
      queryParams.append("skillCategories", skill),
    );
  }
  if (params.certificateCategories?.length) {
    params.certificateCategories.forEach((cert) =>
      queryParams.append("certificateCategories", cert),
    );
  }
  if (params.startAt) queryParams.append("startAt", params.startAt);
  if (params.endAt) queryParams.append("endAt", params.endAt);
  if (params.search) queryParams.append("search", params.search);
  if (params.pageNumber)
    queryParams.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize)
    queryParams.append("pageSize", params.pageSize.toString());

  const url = `/Workers/filter${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await api.get<Worker[] | PaginatedResponse<Worker>>(url);

  // API may return flat array or paginated object — normalize
  return parsePaginatedResponse<Worker>(response);
}

/**
 * Get all workers (simple list)
 * GET /api/Workers
 */
export async function getAllWorkers(): Promise<PaginatedResponse<Worker>> {
  return api.get<PaginatedResponse<Worker>>("/Workers");
}

/**
 * Get worker by ID
 * GET /api/Workers/{id}
 */
export async function getWorkerById(id: string): Promise<Worker> {
  const res = await api.get<Worker | Worker[]>(`/Workers/${id}`);
  if (Array.isArray(res)) {
    // Nếu API trả về mảng, lấy phần tử đầu tiên
    return res[0];
  }
  return res;
}
