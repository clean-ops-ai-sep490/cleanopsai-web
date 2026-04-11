import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type { Skill, CreateSkillData, UpdateSkillData } from "@/types/skill";

// Skill API using CRUD factory with consistent endpoint casing
const skillApi = createSearchableApi<Skill, CreateSkillData, UpdateSkillData>(
  "/Skills",
);

// Export individual functions for backward compatibility
export const {
  create: createSkill,
  getById: getSkillById,
  update: updateSkill,
  delete: deleteSkill,
  getAll: getAllSkills,
  search: searchSkills,
} = skillApi;

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
