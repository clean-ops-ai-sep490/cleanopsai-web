import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import { api } from "@/lib/api";

// ============================================================================
// 1. TYPE DEFINITIONS (Khớp chuẩn với DTOs C#)
// ============================================================================

// Giả định SkillLevelType của C# trả về number (hoặc string tùy vào cấu hình JSON serializer). 
// Bạn có thể đổi thành Enum cụ thể của project nếu cần.
export type SkillLevelType = "Beginner" | "Intermediate" | "Expert"; 

export interface WorkerSkillResponse {
  workerId: string;
  skillId: string;
  workerName: string;
  skillName: string;
  skillLevel: SkillLevelType;
}

export interface WorkerSkillCreateRequest {
  workerId: string;
  skillId: string;
  skillLevel: SkillLevelType;
}

export interface WorkerSkillUpdateRequest {
  skillLevel: SkillLevelType;
}

// Dùng cho các params yêu cầu Khóa phức hợp
export interface WorkerSkillKey {
  workerId: string;
  skillId: string;
}

// ============================================================================
// 2. API CALLS (Logic gọi Backend)
// ============================================================================

const BASE_URL = "/WorkerSkills";

export const workerSkillApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<WorkerSkillResponse>> => {
    const { pageNumber = 1, pageSize = 10 } = params || {};
    // Trả về thẳng response vì api interceptor đã unwrap data rồi
    return await api.get<PaginatedResponse<WorkerSkillResponse>>(
      `${BASE_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  },

  getById: async ({ workerId, skillId }: WorkerSkillKey): Promise<WorkerSkillResponse> => {
    return await api.get<WorkerSkillResponse>(
      `${BASE_URL}/${encodeURIComponent(workerId)}/${encodeURIComponent(skillId)}`
    );
  },

  create: async (data: WorkerSkillCreateRequest): Promise<WorkerSkillResponse> => {
    return await api.post<WorkerSkillResponse>(BASE_URL, data);
  },

  update: async (
    keys: WorkerSkillKey,
    data: WorkerSkillUpdateRequest
  ): Promise<WorkerSkillResponse> => {
    return await api.put<WorkerSkillResponse>(
      `${BASE_URL}/${encodeURIComponent(keys.workerId)}/${encodeURIComponent(keys.skillId)}`,
      data
    );
  },

  delete: async ({ workerId, skillId }: WorkerSkillKey): Promise<number> => {
    return await api.delete<number>(
      `${BASE_URL}/${encodeURIComponent(workerId)}/${encodeURIComponent(skillId)}`
    );
  },
};

// ============================================================================
// 3. QUERY KEY FACTORY (Quản lý Cache tập trung)
// ============================================================================

export const WORKER_SKILL_KEYS = {
  all: ["worker-skills"] as const,
  lists: () => [...WORKER_SKILL_KEYS.all, "list"] as const,
  list: (params?: PaginationParams) => [...WORKER_SKILL_KEYS.lists(), params] as const,
  details: () => [...WORKER_SKILL_KEYS.all, "detail"] as const,
  detail: (keys: WorkerSkillKey) => 
    [...WORKER_SKILL_KEYS.details(), keys.workerId, keys.skillId] as const,
};

// ============================================================================
// 4. REACT QUERY HOOKS (Single Responsibility)
// ============================================================================

/**
 * Lấy danh sách Worker Skills có phân trang
 */
export function useWorkerSkills(params?: PaginationParams) {
  return useQuery({
    queryKey: WORKER_SKILL_KEYS.list(params),
    queryFn: () => workerSkillApi.getAll(params),
  });
}

/**
 * Lấy chi tiết Worker Skill theo ID (Khóa phức hợp)
 */
export function useWorkerSkill(keys?: WorkerSkillKey) {
  const isEnabled = !!keys?.workerId && !!keys?.skillId;

  return useQuery({
    queryKey: isEnabled ? WORKER_SKILL_KEYS.detail(keys) : WORKER_SKILL_KEYS.details(),
    queryFn: () => workerSkillApi.getById(keys!),
    enabled: isEnabled, // Tránh gọi API nếu thiếu ID
  });
}

/**
 * Thêm mới Worker Skill
 */
export function useCreateWorkerSkill() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: workerSkillApi.create,
    onSuccess: () => {
      // Hủy cache danh sách để load lại data mới
      qc.invalidateQueries({ queryKey: WORKER_SKILL_KEYS.lists() });
    },
  });
}

/**
 * Cập nhật level của Worker Skill
 */
export function useUpdateWorkerSkill() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: ({ keys, data }: { keys: WorkerSkillKey; data: WorkerSkillUpdateRequest }) =>
      workerSkillApi.update(keys, data),
    onSuccess: (updatedData, variables) => {
      qc.invalidateQueries({ queryKey: WORKER_SKILL_KEYS.lists() });
      // Tối ưu UX: Cập nhật luôn cache chi tiết bằng data mới trả về từ BE
      qc.setQueryData(WORKER_SKILL_KEYS.detail(variables.keys), updatedData);
    },
  });
}

/**
 * Xóa Worker Skill
 */
export function useDeleteWorkerSkill() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: workerSkillApi.delete,
    onSuccess: (deletedCount) => {
      if ((deletedCount ?? 0) > 0) {
        qc.invalidateQueries({ queryKey: WORKER_SKILL_KEYS.all });
      }
    },
  });
}