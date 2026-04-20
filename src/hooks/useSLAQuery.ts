import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastUtils } from "@/lib/utils/toast-utils";
import {
  getSLAs,
  getSLAById,
  updateSLA,
  deleteSLA,
  getSLAShiftsBySLA,
  getSLATasksBySLA,
  getSLATasks,
} from "@/lib/sla-api";
import type { SLA } from "@/types/sla";

// Hook to get all SLAs
export function useSLAs() {
  return useQuery({
    queryKey: ["slas"],
    queryFn: getSLAs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Main useSLAQuery function - matches file name
export function useSLAQuery() {
  const tasksQuery = useQuery({
    queryKey: ["sla-tasks"],
    queryFn: getSLATasks,
  });

  const slasQuery = useSLAs();

  return {
    data: {
      slaTasks: tasksQuery.data || [],
      slas: slasQuery.data || [],
    },
    isLoading: tasksQuery.isLoading || slasQuery.isLoading,
    error: tasksQuery.error || slasQuery.error,
  };
}

// Get single SLA
export function useSLA(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["slas", id],
    queryFn: async () => {
      const result = await getSLAById(id);
      // Handle case where API returns array instead of single object
      return Array.isArray(result) ? result[0] : result;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

// Get SLA with related data
export function useSLAWithDetails(id: string) {
  const slaQuery = useSLA(id);

  const shiftsQuery = useQuery({
    queryKey: ["sla-shifts", id],
    queryFn: () => getSLAShiftsBySLA(id),
    enabled: !!id,
  });

  const tasksQuery = useQuery({
    queryKey: ["sla-tasks", id],
    queryFn: () => getSLATasksBySLA(id),
    enabled: !!id,
  });

  return {
    sla: slaQuery.data,
    shifts: shiftsQuery.data || [],
    tasks: tasksQuery.data || [],
    isLoading:
      slaQuery.isLoading || shiftsQuery.isLoading || tasksQuery.isLoading,
    error: slaQuery.error || shiftsQuery.error || tasksQuery.error,
  };
}

// Update SLA
export function useUpdateSLA(onSuccess?: (sla: SLA) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSLA(id, data),
    onSuccess: (data, variables) => {
      toastUtils.success("Cập nhật SLA thành công!");
      queryClient.invalidateQueries({ queryKey: ["slas"] });
      queryClient.invalidateQueries({ queryKey: ["slas", variables.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      toastUtils.error("Không thể cập nhật SLA");
      console.error("SLA update error:", error);
    },
  });
}

// Delete SLA
export function useDeleteSLA(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSLA,
    onSuccess: (_, deletedId) => {
      toastUtils.success("Đã xóa SLA thành công");
      queryClient.removeQueries({ queryKey: ["slas", deletedId] });
      queryClient.invalidateQueries({ queryKey: ["slas"] });
      onSuccess?.();
    },
    onError: (error) => {
      toastUtils.error("Không thể xóa SLA");
      console.error("SLA deletion error:", error);
    },
  });
}
