import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type { Skill, CreateSkillData, UpdateSkillData } from "@/types/skill";

// Skill API using CRUD factory with consistent endpoint casing
const skillApi = createSearchableApi<Skill, CreateSkillData, UpdateSkillData>(
  "/Skills",
);

// Explicit wrappers for CRUD/search to match backend behavior
export async function createSkill(data: CreateSkillData): Promise<Skill> {
  return skillApi.create(data);
}

export async function getSkillById(id: string): Promise<Skill> {
  return skillApi.getById(id);
}

export async function updateSkill(id: string, data: UpdateSkillData): Promise<Skill> {
  return skillApi.update(id, data);
}

export async function deleteSkill(id: string): Promise<number> {
  const result = await api.delete<number>(`/Skills/${encodeURIComponent(id)}`);
  return result ?? 0;
}

export async function getAllSkills(): Promise<Skill[]> {
  return skillApi.getAll();
}

export async function searchSkills(
  query: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  additionalParams: Record<string, any> = {},
): Promise<PaginatedResponse<Skill>> {
  return skillApi.search(query, pageNumber, pageSize, additionalParams);
}

// Custom paginated function to maintain existing interface
export async function getSkills(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Skill>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return skillApi.getPaginated(pageNumber, pageSize, { search });
}

// Custom function for getting Skills by Category (legacy)
export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const response = await api.get<any>(`/Skills?category=${category}`);
  return parseArrayResponse<Skill>(response);
}

// Get all skill categories
export async function getSkillCategories(): Promise<any[]> {
  const response = await api.get<any>("/Skills/categories");
  return parseArrayResponse<any>(response);
}

// Get skills by category name (updated to handle string category)
export async function getSkillsByCategoryId(
  category: string,
): Promise<Skill[]> {
  const response = await api.get<any>(
    `/Skills/by-category?category=${encodeURIComponent(category)}`,
  );
  return parseArrayResponse<Skill>(response);
}

// Get skills by a list of ids
export async function getSkillsByIds(ids: string[]): Promise<Skill[]> {
  if (!ids || ids.length === 0) return [];
  const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
  const response = await api.get<any>(`/Skills/batch?${query}`);
  return parseArrayResponse<Skill>(response);
}

// Get skills for a specific worker
export async function getSkillsByWorkerId(workerId: string): Promise<Skill[]> {
  if (!workerId) return [];
  const response = await api.get<any>(`/Skills/worker/${encodeURIComponent(workerId)}/skills`);
  return parseArrayResponse<Skill>(response);
}
