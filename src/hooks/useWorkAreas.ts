import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getWorkAreas,
  getWorkAreasPaginated,
  searchWorkAreas,
  createWorkArea,
  updateWorkArea,
  deleteWorkArea,
  getWorkAreaById,
} from "@/lib/work-area-api";
import type { PaginationParams } from "@/types/common";
import type { WorkAreaFormData, WorkArea } from "@/types/contract";

export function useWorkAreas(params?: PaginationParams & { zoneId?: string }) {
  return useBaseQuery(["workareas", params], () =>
    getWorkAreasPaginated(params || {}),
  );
}

export function useAllWorkAreas() {
  return useBaseQuery(["workareas", "all"], () => getWorkAreas());
}

export function useWorkArea(id?: string) {
  return useBaseQuery(["workareas", "detail", id], () => getWorkAreaById(id!), {
    enabled: !!id,
  });
}

export function useWorkAreasByZone(zoneId?: string, params?: PaginationParams) {
  return useBaseQuery(
    ["workareas", "zone", zoneId, params],
    () => getWorkAreasPaginated({ ...params, zoneId }),
    { enabled: !!zoneId },
  );
}

export function useSearchWorkAreas(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["workareas", "search", keyword, pageNumber, pageSize],
    () => searchWorkAreas(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateWorkArea() {
  return useBaseMutation(
    (data: WorkAreaFormData) => createWorkArea(data),
    [["workareas"]],
  );
}

export function useUpdateWorkArea() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: WorkAreaFormData }) =>
      updateWorkArea(id, data),
    [["workareas"]],
  );
}

export function useDeleteWorkArea() {
  return useBaseMutation((id: string) => deleteWorkArea(id), [["workareas"]]);
}

export default useWorkAreas;
