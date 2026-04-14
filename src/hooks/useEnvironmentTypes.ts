import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getAllEnvironmentTypes,
  getEnvironmentTypesPaginated,
  searchEnvironmentTypes,
  createEnvironmentType,
  updateEnvironmentType,
  deleteEnvironmentType,
  getEnvironmentTypeById,
} from "@/lib/environment-type-api";
import type { PaginationParams } from "@/types/common";
import type {
  EnvironmentType,
  CreateEnvironmentTypeData,
  UpdateEnvironmentTypeData,
} from "@/types/sop";

export function useEnvironmentTypes(params?: PaginationParams) {
  return useBaseQuery(["environmentTypes", params], () =>
    getEnvironmentTypesPaginated(params || {}),
  );
}

export function useAllEnvironmentTypes() {
  return useBaseQuery(["environmentTypes", "all"], () =>
    getAllEnvironmentTypes(),
  );
}

export function useEnvironmentType(id?: string) {
  return useBaseQuery(
    ["environmentTypes", "detail", id],
    () => getEnvironmentTypeById(id!),
    { enabled: !!id },
  );
}

export function useSearchEnvironmentTypes(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["environmentTypes", "search", keyword, pageNumber, pageSize],
    () => searchEnvironmentTypes(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateEnvironmentType() {
  return useBaseMutation(
    (data: CreateEnvironmentTypeData) => createEnvironmentType(data),
    [["environmentTypes"]],
  );
}

export function useUpdateEnvironmentType() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateEnvironmentTypeData }) =>
      updateEnvironmentType(id, data),
    [["environmentTypes"]],
  );
}

export function useDeleteEnvironmentType() {
  return useBaseMutation(
    (id: string) => deleteEnvironmentType(id),
    [["environmentTypes"]],
  );
}

export default useEnvironmentTypes;
