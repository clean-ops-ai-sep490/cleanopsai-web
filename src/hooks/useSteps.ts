import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
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
  return useBaseQuery(["steps", params], () => getSteps(params));
}

// search
export function useSearchSteps(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["steps", "search", keyword, pageNumber, pageSize],
    () => searchSteps(keyword ?? "", pageNumber, pageSize),
  );
}

// all
export function useAllSteps() {
  return useBaseQuery(["steps", "all"], () => getAllSteps());
}

// create
export function useCreateStep() {
  return useBaseMutation(
    (data: CreateStepData) => createStep(data),
    [["steps"]],
  );
}

// update
export function useUpdateStep() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateStepData }) =>
      updateStep(id, data),
    [["steps"]],
  );
}

// delete
export function useDeleteStep() {
  return useBaseMutation((id: string) => deleteStep(id), [["steps"]]);
}
