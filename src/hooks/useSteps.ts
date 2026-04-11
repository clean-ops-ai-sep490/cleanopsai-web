import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSteps,
  searchSteps,
  createStep,
  updateStep,
  deleteStep,
  getAllSteps,
} from "@/lib/step-api";

import type { PaginationParams } from "@/types/common";
import type { CreateStepData, UpdateStepData } from "@/types/sop";

// list pagination
export function useSteps(params?: PaginationParams) {
  return useQuery({
    queryKey: ["steps", params],
    queryFn: () => getSteps(params),
  });
}

// search
export function useSearchSteps(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useQuery({
    queryKey: ["steps", "search", keyword, pageNumber, pageSize],
    queryFn: () => searchSteps(keyword ?? "", pageNumber, pageSize),
    keepPreviousData: true,
  });
}

// all
export function useAllSteps() {
  return useQuery({
    queryKey: ["steps", "all"],
    queryFn: () => getAllSteps(),
  });
}

// create
export function useCreateStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStepData) => createStep(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["steps"] }),
  });
}

// update
export function useUpdateStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStepData }) =>
      updateStep(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["steps"] }),
  });
}

// delete
export function useDeleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStep(id),
    onSuccess: (res: number) => {
      if (res > 0) qc.invalidateQueries({ queryKey: ["steps"] });
    },
  });
}