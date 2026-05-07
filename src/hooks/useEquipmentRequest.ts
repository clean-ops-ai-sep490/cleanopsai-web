import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";

import {
  getEquipmentRequestById,
  getEquipmentRequestsByStatus,
  getEquipmentRequestsByTaskAssignment,
  getEquipmentRequestsByWorker,
  createEquipmentRequest,
  updateEquipmentRequest,
  reviewEquipmentRequest,
  deleteEquipmentRequest,
  getEquipmentRequestsPaginated,
} from "@/lib/equipment-request-api";

import type { PaginationParams } from "@/types/common";

/* ================= TYPES ================= */

export type EquipmentRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface EquipmentRequestItem {
  equipmentId: string;
  quantity: number;
  equipmentName?: string;
}

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

export interface CreateEquipmentRequestDto {
  taskAssignmentId: string;
  workerId: string;
  reason?: string;
  items: {
    equipmentId: string;
    quantity: number;
  }[];
}

export interface UpdateEquipmentRequestDto {
  reason?: string;
  items?: {
    equipmentId: string;
    quantity: number;
  }[];
}

export interface ReviewEquipmentRequestDto {
  status: EquipmentRequestStatus;
}

/* ================= LIST ================= */

export function useEquipmentRequests(params?: PaginationParams) {
  return useBaseQuery(
    ["equipment-requests", params],
    () => getEquipmentRequestsPaginated(params),
  );
}

/* ================= DETAIL ================= */

export function useEquipmentRequest(id?: string) {
  return useBaseQuery(
    ["equipment-requests", "detail", id],
    () => getEquipmentRequestById(id!),
    {
      enabled: !!id,
    },
  );
}

/* ================= FILTERS ================= */

export function useEquipmentRequestsByStatus(
  status?: EquipmentRequestStatus,
  params?: PaginationParams,
) {
  return useBaseQuery(
    ["equipment-requests", "status", status, params],
    () => getEquipmentRequestsByStatus(status!, params),
    {
      enabled: !!status,
    },
  );
}

export function useEquipmentRequestsByTaskAssignment(
  taskAssignmentId?: string,
  params?: PaginationParams,
) {
  return useBaseQuery(
    ["equipment-requests", "task", taskAssignmentId, params],
    () => getEquipmentRequestsByTaskAssignment(taskAssignmentId!, params),
    {
      enabled: !!taskAssignmentId,
    },
  );
}

export function useEquipmentRequestsByWorker(
  workerId?: string,
  params?: PaginationParams,
) {
  return useBaseQuery(
    ["equipment-requests", "worker", workerId, params],
    () => getEquipmentRequestsByWorker(workerId!, params),
    {
      enabled: !!workerId,
    },
  );
}

/* ================= SEARCH (optional) ================= */

export function useSearchEquipmentRequests(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["equipment-requests", "search", keyword, pageNumber, pageSize],
    () =>
      getEquipmentRequestsPaginated({
        pageNumber,
        pageSize,
        search: keyword ?? "",
      }),
  );
}

/* ================= MUTATIONS ================= */

export function useCreateEquipmentRequest() {
  return useBaseMutation(
    (data: CreateEquipmentRequestDto) => createEquipmentRequest(data),
    [["equipment-requests"]],
  );
}

export function useUpdateEquipmentRequest() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateEquipmentRequestDto }) =>
      updateEquipmentRequest(id, data),
    [["equipment-requests"]],
  );
}

export function useReviewEquipmentRequest() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: ReviewEquipmentRequestDto }) =>
      reviewEquipmentRequest(id, data),
    [["equipment-requests"]],
  );
}

export function useDeleteEquipmentRequest() {
  return useBaseMutation(
    (id: string) => deleteEquipmentRequest(id),
    [["equipment-requests"]],
  );
}

/* ================= DEFAULT ================= */

export default useEquipmentRequests;
