import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getSkills,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  searchSkills,
  getSkillsByCategoryId,
  getSkillCategories,
} from "@/lib/skill-api";
import type { PaginationParams } from "@/types/common";
import type { CreateSkillData, UpdateSkillData } from "@/types/skill";

export function useSkills(params?: PaginationParams) {
  return useBaseQuery(["skills", params], () => getSkills(params));
}

export function useAllSkills() {
  return useBaseQuery(["skills", "all"], () => getAllSkills());
}

export function useSearchSkills(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["skills", "search", keyword, pageNumber, pageSize],
    () => searchSkills(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateSkill() {
  return useBaseMutation(
    (data: CreateSkillData) => createSkill(data),
    [["skills"]],
  );
}

export function useUpdateSkill() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateSkillData }) =>
      updateSkill(id, data),
    [["skills"]],
  );
}

export function useDeleteSkill() {
  return useBaseMutation((id: string) => deleteSkill(id), [["skills"]]);
}

export function useSkillsByCategory(category: string) {
  return useBaseQuery(
    ["skills", "category", category],
    () => getSkillsByCategoryId(category),
    { enabled: !!category && category !== "all" },
  );
}

export function useSkillCategories() {
  return useBaseQuery(["skills", "categories"], getSkillCategories);
}

export default useSkills;
