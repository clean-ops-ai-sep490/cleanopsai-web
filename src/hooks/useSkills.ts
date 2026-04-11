import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["skills", params],
    queryFn: () => getSkills(params),
  });
}

export function useAllSkills() {
  return useQuery({
    queryKey: ["skills", "all"],
    queryFn: () => getAllSkills(),
  });
}

export function useSearchSkills(keyword?: string | null, pageNumber = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["skills", "search", keyword, pageNumber, pageSize],
    queryFn: () => searchSkills(keyword ?? "", pageNumber, pageSize),
    keepPreviousData: true,
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSkillData) => createSkill(data),
    onSuccess: () => qc.invalidateQueries(["skills"]),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSkillData }) =>
      updateSkill(id, data),
    onSuccess: () => qc.invalidateQueries(["skills"]),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: (deletedCount: number) => {
      if ((deletedCount ?? 0) > 0) qc.invalidateQueries(["skills"]);
    },
  });
}

export function useSkillsByCategory(category: string) {
  return useQuery({
    queryKey: ["skills", "category", category],
    queryFn: () => getSkillsByCategoryId(category),
    enabled: !!category && category !== "all",
  });
}

export function useSkillCategories() {
  return useQuery({
    queryKey: ["skills", "categories"],
    queryFn: getSkillCategories,
  });
}
export default useSkills;
