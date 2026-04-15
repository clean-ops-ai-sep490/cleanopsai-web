import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import { api } from "@/lib/api";

// ============================================================================
// 1. TYPE DEFINITIONS (Khớp chuẩn 100% với DTOs C#)
// ============================================================================

export interface WorkerCertificationResponse {
  workerId: string;
  certificationId: string;
  workerName: string;
  certificationName: string;
  issuedDate: string;
  expiredAt?: string | null;
}

export interface WorkerCertificationCreateRequest {
  workerId: string;
  certificationId: string;
  issuedDate: string;
  expiredAt?: string | null;
}

export interface WorkerCertificationUpdateRequest {
  issuedDate: string;
  expiredAt?: string | null;
}

// Interface riêng cho Composite Key để dùng trong các hàm Detail/Update/Delete
export interface WorkerCertificationKey {
  workerId: string;
  certificationId: string;
}

// ============================================================================
// 2. API CALLS (Logic gọi Backend)
// ============================================================================

const BASE_URL = "/WorkerCertifications";

export const workerCertApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<WorkerCertificationResponse>> => {
    const { pageNumber = 1, pageSize = 10 } = params || {};
    // Trả thẳng về kết quả vì Axios Interceptor đã bóc tách layer data
    return await api.get<PaginatedResponse<WorkerCertificationResponse>>(
      `${BASE_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  },

  getById: async ({ workerId, certificationId }: WorkerCertificationKey): Promise<WorkerCertificationResponse> => {
    return await api.get<WorkerCertificationResponse>(
      `${BASE_URL}/${encodeURIComponent(workerId)}/${encodeURIComponent(certificationId)}`
    );
  },

  create: async (data: WorkerCertificationCreateRequest): Promise<WorkerCertificationResponse> => {
    return await api.post<WorkerCertificationResponse>(BASE_URL, data);
  },

  update: async (
    keys: WorkerCertificationKey,
    data: WorkerCertificationUpdateRequest
  ): Promise<WorkerCertificationResponse> => {
    return await api.put<WorkerCertificationResponse>(
      `${BASE_URL}/${encodeURIComponent(keys.workerId)}/${encodeURIComponent(keys.certificationId)}`,
      data
    );
  },

  delete: async ({ workerId, certificationId }: WorkerCertificationKey): Promise<number> => {
    return await api.delete<number>(
      `${BASE_URL}/${encodeURIComponent(workerId)}/${encodeURIComponent(certificationId)}`
    );
  },
};

// ============================================================================
// 3. QUERY KEY FACTORY (Quản lý Cache chuẩn Claude)
// ============================================================================

export const WORKER_CERT_KEYS = {
  all: ["worker-certifications"] as const,
  lists: () => [...WORKER_CERT_KEYS.all, "list"] as const,
  list: (params?: PaginationParams) => [...WORKER_CERT_KEYS.lists(), params] as const,
  details: () => [...WORKER_CERT_KEYS.all, "detail"] as const,
  // Key chi tiết bắt buộc phải có cả 2 ID
  detail: (keys: WorkerCertificationKey) => 
    [...WORKER_CERT_KEYS.details(), keys.workerId, keys.certificationId] as const,
};

// ============================================================================
// 4. REACT QUERY HOOKS (Sạch & Single Responsibility)
// ============================================================================

/**
 * Hook: Lấy danh sách có phân trang
 */
export function useWorkerCertifications(params?: PaginationParams) {
  return useQuery({
    queryKey: WORKER_CERT_KEYS.list(params),
    queryFn: () => workerCertApi.getAll(params),
  });
}

/**
 * Hook: Lấy chi tiết theo Composite Key (WorkerId + CertificationId)
 */
export function useWorkerCertification(keys?: WorkerCertificationKey) {
  const isEnabled = !!keys?.workerId && !!keys?.certificationId;

  return useQuery({
    queryKey: isEnabled ? WORKER_CERT_KEYS.detail(keys) : WORKER_CERT_KEYS.details(),
    queryFn: () => workerCertApi.getById(keys!),
    enabled: isEnabled, // Fail Fast: Không gọi API nếu thiếu ID
  });
}

/**
 * Hook: Thêm mới
 */
export function useCreateWorkerCertification() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: workerCertApi.create,
    onSuccess: () => {
      // Clear cache danh sách để fetch lại data mới
      qc.invalidateQueries({ queryKey: WORKER_CERT_KEYS.lists() });
    },
  });
}

/**
 * Hook: Cập nhật
 */
export function useUpdateWorkerCertification() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ keys, data }: { keys: WorkerCertificationKey; data: WorkerCertificationUpdateRequest }) =>
      workerCertApi.update(keys, data),
    onSuccess: (updatedData, variables) => {
      // 1. Hủy cache danh sách
      qc.invalidateQueries({ queryKey: WORKER_CERT_KEYS.lists() });
      // 2. Cập nhật trực tiếp cache chi tiết (Tối ưu UX, không cần fetch lại chi tiết)
      qc.setQueryData(WORKER_CERT_KEYS.detail(variables.keys), updatedData);
    },
  });
}

/**
 * Hook: Xóa
 */
export function useDeleteWorkerCertification() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: workerCertApi.delete,
    onSuccess: (deletedCount) => {
      if ((deletedCount ?? 0) > 0) {
        qc.invalidateQueries({ queryKey: WORKER_CERT_KEYS.all });
      }
    },
  });
}