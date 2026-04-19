import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getAllWorkAreaDetails,
  getWorkAreaDetailsPaginated,
  searchWorkAreaDetails,
  createWorkAreaDetail,
  updateWorkAreaDetail,
  deleteWorkAreaDetail,
  getWorkAreaDetailById,
  getWorkAreaDetailsByWorkArea,
  getWorkAreaDetailsByWorkAreaId,
} from "@/lib/work-area-detail-api";
import type { PaginationParams } from "@/types/common";
import type {
  CreateWorkAreaDetailData,
  UpdateWorkAreaDetailData,
} from "@/types/work-area-detail";

export function useWorkAreaDetails(params?: PaginationParams) {
  return useBaseQuery(["workAreaDetails", params], () =>
    getWorkAreaDetailsPaginated(
      params?.pageNumber || 1,
      params?.pageSize || 10,
    ),
  );
}

export function useAllWorkAreaDetails() {
  return useBaseQuery(["workAreaDetails", "all"], () =>
    getAllWorkAreaDetails(),
  );
}

export function useWorkAreaDetail(id?: string) {
  return useBaseQuery(
    ["workAreaDetails", "detail", id],
    () => getWorkAreaDetailById(id!),
    {
      enabled: !!id,
    },
  );
}

export function useWorkAreaDetailsByWorkArea(
  workAreaId?: string,
  params?: { pageNumber?: number; pageSize?: number },
) {
  return useBaseQuery(
    ["workAreaDetails", "byWorkArea", workAreaId, params],
    () => getWorkAreaDetailsByWorkArea(workAreaId!, params),
    {
      enabled: !!workAreaId,
    },
  );
}

export function useSearchWorkAreaDetails(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["workAreaDetails", "search", keyword, pageNumber, pageSize],
    () => searchWorkAreaDetails(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateWorkAreaDetail() {
  return useBaseMutation(
    (data: CreateWorkAreaDetailData) => createWorkAreaDetail(data),
    [["workAreaDetails"]],
  );
}

export function useUpdateWorkAreaDetail() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateWorkAreaDetailData }) =>
      updateWorkAreaDetail(id, data),
    [["workAreaDetails"]],
  );
}

export function useDeleteWorkAreaDetail() {
  return useBaseMutation(
    (id: string) => deleteWorkAreaDetail(id),
    [["workAreaDetails"]],
  );
}

export function useWorkAreaDetailsByWorkAreaId(
  workAreaId?: string,
  params?: { pageNumber?: number; pageSize?: number }
) {
  return useBaseQuery(
    ["workAreaDetails", "byWorkArea", workAreaId, params],
    () => getWorkAreaDetailsByWorkAreaId(workAreaId!, params),
    {
      enabled: !!workAreaId,
    }
  );
}

export default useWorkAreaDetails;
