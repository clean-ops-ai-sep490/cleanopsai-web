import { createSearchableApi } from "./api-crud-factory";
import { api } from "./api";
import { parseArrayResponse } from "./api-response-parser";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type { Step, CreateStepData, UpdateStepData } from "@/types/sop";

// CRUD factory
const stepApi = createSearchableApi<Step, CreateStepData, UpdateStepData>(
  "/Steps",
);

// CRUD basic
export async function createStep(data: CreateStepData): Promise<Step> {
  return stepApi.create(data);
}

export async function getStepById(id: string): Promise<Step> {
  return stepApi.getById(id);
}

export async function updateStep(
  id: string,
  data: UpdateStepData,
): Promise<Step> {
  return stepApi.update(id, data);
}

export async function deleteStep(id: string): Promise<number> {
  const result = await api.delete<number>(`/Steps/${encodeURIComponent(id)}`);
  return result ?? 0;
}

export async function getAllSteps(): Promise<Step[]> {
  return stepApi.getAll();
}

// pagination
export async function getSteps(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Step>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return stepApi.getPaginated(pageNumber, pageSize, { search });
}

// search
export async function searchSteps(
  query: string,
  pageNumber = 1,
  pageSize = 10,
  additionalParams: Record<string, any> = {},
): Promise<PaginatedResponse<Step>> {
  return stepApi.search(query, pageNumber, pageSize, additionalParams);
}

// OPTIONAL: nếu backend trả configSchema object → convert string
export function normalizeStepPayload(data: CreateStepData): CreateStepData {
  return {
    ...data,
    configSchema:
      typeof data.configSchema === "string"
        ? data.configSchema
        : JSON.stringify(data.configSchema),
  };
}

// OPTIONAL: parse configSchema khi render UI
export function parseStepConfig(step: Step) {
  try {
    return {
      ...step,
      configSchema: JSON.parse(step.configSchema as any),
    };
  } catch {
    return step;
  }
}