import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type {
  WorkerSkill,
  CreateWorkerSkillData,
  UpdateWorkerSkillData,
} from "@/types/skill";

// Worker Skills API using CRUD factory with consistent endpoint casing
const workerSkillApi = createSearchableApi<
  WorkerSkill,
  CreateWorkerSkillData,
  UpdateWorkerSkillData
>("/WorkerSkills");

export const {
  create: createWorkerSkill,
  update: updateWorkerSkill,
  delete: deleteWorkerSkill,
} = workerSkillApi;

// Custom function for getting Worker Skills by Worker ID
export async function getWorkerSkills(
  workerId: string,
): Promise<WorkerSkill[]> {
  const response = await api.get<any>(`/WorkerSkills?workerId=${workerId}`);
  return parseArrayResponse<WorkerSkill>(response);
}
