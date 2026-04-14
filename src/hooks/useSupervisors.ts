import { useBaseQuery, useBaseSearchQuery } from "./useBaseQuery";
import {
  getAllSupervisors,
  getSupervisorsPaginated,
  searchSupervisors,
  searchSupervisorsByKeyword,
} from "@/lib/supervisor-api";
import type { Supervisor } from "@/types/supervisor";

export function useSupervisors(params?: {
  pageNumber?: number;
  pageSize?: number;
}) {
  return useBaseQuery(["supervisors", params], () =>
    getSupervisorsPaginated(params?.pageNumber || 1, params?.pageSize || 10),
  );
}

export function useAllSupervisors() {
  return useBaseQuery(["supervisors", "all"], () => getAllSupervisors());
}

export function useSearchSupervisors(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["supervisors", "search", keyword, pageNumber, pageSize],
    () => searchSupervisorsByKeyword(keyword ?? "", { pageNumber, pageSize }),
  );
}

export default useSupervisors;
