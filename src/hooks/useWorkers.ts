import { useQuery } from "@tanstack/react-query";
import {
  filterWorkers,
  getAllWorkers,
  getWorkerById,
  WorkerFilterParams,
} from "@/lib/worker-api";

// Query keys
export const workerKeys = {
  all: ["workers"] as const,
  lists: () => [...workerKeys.all, "list"] as const,
  list: (params: WorkerFilterParams) =>
    [...workerKeys.lists(), params] as const,
  details: () => [...workerKeys.all, "detail"] as const,
  detail: (id: string) => [...workerKeys.details(), id] as const,
  filtered: (params: WorkerFilterParams) =>
    [...workerKeys.all, "filtered", params] as const,
};

// Get all workers
export function useWorkers() {
  return useQuery({
    queryKey: workerKeys.lists(),
    queryFn: getAllWorkers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single worker
export function useWorker(id: string) {
  return useQuery({
    queryKey: workerKeys.detail(id),
    queryFn: () => getWorkerById(id),
    enabled: !!id,
  });
}

// Filter workers with smart parameters
export function useFilteredWorkers(
  params: WorkerFilterParams,
  enabled: boolean = true,
) {
  // If no filter params, get all workers
  const hasFilterParams = !!(
    params.address ||
    params.skillCategories?.length ||
    params.certificateCategories?.length ||
    params.startAt ||
    params.endAt
  );

  return useQuery({
    queryKey: hasFilterParams
      ? workerKeys.filtered(params)
      : workerKeys.lists(),
    queryFn: () => (hasFilterParams ? filterWorkers(params) : getAllWorkers()),
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes for filtered results
  });
}
