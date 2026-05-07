import { createSearchableApi } from "./api-crud-factory";
import { api } from "./api";

import type {
  PaginatedRequest,
} from "@/types/common";
import { parsePaginatedResponse } from "./api-response-parser";

/* ================= TYPES ================= */

export interface EquipmentRequestItem {
  equipmentId: string;
  quantity: number;
  equipmentName?: string;
}

export type EquipmentRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface EquipmentRequest {
  id: string;
  taskAssignmentId: string;
  workerId: string;
  workerName?: string;
  reason?: string;
  items: EquipmentRequestItem[];
  status: EquipmentRequestStatus;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  created: string;
  approvedAt?: string;
}

/* ================= REQUEST DTO ================= */

export interface CreateEquipmentRequestFormData {
  taskAssignmentId: string;
  workerId: string;
  reason?: string;
  items: {
    equipmentId: string;
    quantity: number;
  }[];
}

export type UpdateEquipmentRequestFormData = Partial<CreateEquipmentRequestFormData>;

/* ================= FACTORY API ================= */

const equipmentRequestApi = createSearchableApi<
  EquipmentRequest,
  CreateEquipmentRequestFormData,
  UpdateEquipmentRequestFormData
>("/EquipmentRequests");

/* ================= EXPORT BASIC CRUD ================= */

export const {
  create: createEquipmentRequest,
  getById: getEquipmentRequestById,
  update: updateEquipmentRequest,
  delete: deleteEquipmentRequest,
  getAll: getEquipmentRequests,
  getPaginated: getEquipmentRequestsPaginatedNew,
  search: searchEquipmentRequests,
} = equipmentRequestApi;

/* ================= LEGACY PAGINATION ================= */

export interface EquipmentRequestsPaginatedRequest extends PaginatedRequest {
  status?: EquipmentRequestStatus;
  workerId?: string;
  taskAssignmentId?: string;
}

export interface EquipmentRequestsPaginatedResponse {
  items: EquipmentRequest[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export async function getEquipmentRequestsPaginated(
  params: EquipmentRequestsPaginatedRequest = {},
): Promise<EquipmentRequestsPaginatedResponse> {
  const {
    pageNumber = 1,
    pageSize = 10,
    status,
    workerId,
    taskAssignmentId,
    search,
  } = params;

  try {
    const queryString = new URLSearchParams();

    queryString.append("pageNumber", String(pageNumber));
    queryString.append("pageSize", String(pageSize));

    if (status) queryString.append("status", status);
    if (workerId) queryString.append("workerId", workerId);
    if (taskAssignmentId) queryString.append("taskAssignmentId", taskAssignmentId);
    if (search) queryString.append("search", search);

    const response = await api.get<any>(
      `/EquipmentRequests?${queryString.toString()}`
    );

    // 🔥 QUAN TRỌNG: normalize giống Location
    const parsed = parsePaginatedResponse<EquipmentRequest>(
      response,
      pageNumber,
      pageSize
    );

    return {
      items: parsed.content,
      totalCount: parsed.totalElements,
      pageNumber: parsed.pageNumber,
      pageSize: parsed.pageSize,
    };
  } catch (error) {
    console.error("Failed to load equipment requests:", error);
    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
  }
}

/* ================= FILTER ENDPOINTS ================= */

export async function getEquipmentRequestsByStatus(
  status: EquipmentRequestStatus,
  params: PaginatedRequest = {},
) {
  const { pageNumber = 1, pageSize = 10 } = params;

  try {
    const response = await api.get<any>(
      `/EquipmentRequests/status/${status}`,
      {
        params: { pageNumber, pageSize },
      }
    );

    // ⚠️ QUAN TRỌNG: lấy đúng data shape
    const data = response?.data ?? response;

    console.log("STATUS API RAW:", response);
console.log("STATUS DATA:", response?.data);

    return {
      items: data?.content ?? [],
      totalCount: data?.totalElements ?? 0,
      pageNumber: data?.pageNumber ?? pageNumber,
      pageSize: data?.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error("status API failed:", error);

    return {
      items: [],
      totalCount: 0,
      pageNumber,
      pageSize,
    };
  }
}

export async function getEquipmentRequestsByTaskAssignment(
  taskAssignmentId: string,
  params: PaginatedRequest = {},
) {
  const { pageNumber = 1, pageSize = 10 } = params;

  const response = await api.get(
    `/EquipmentRequests/task-assignment/${taskAssignmentId}`,
    {
      params: { pageNumber, pageSize },
    },
  );

  return parsePaginatedResponse<EquipmentRequest>(
    response,
    pageNumber,
    pageSize,
  );
}

export async function getEquipmentRequestsByWorker(
  workerId: string,
  params: PaginatedRequest = {},
) {
  const { pageNumber = 1, pageSize = 10 } = params;

  const response = await api.get(
    `/EquipmentRequests/worker/${workerId}`,
    {
      params: { pageNumber, pageSize },
    },
  );

  return parsePaginatedResponse<EquipmentRequest>(
    response,
    pageNumber,
    pageSize,
  );
}
/* ================= REVIEW API ================= */

export async function reviewEquipmentRequest(
  id: string,
  data: { status: EquipmentRequestStatus },
): Promise<EquipmentRequest> {
  return await api.patch<EquipmentRequest>(
    `/EquipmentRequests/${id}/review`,
    data,
  );
}
