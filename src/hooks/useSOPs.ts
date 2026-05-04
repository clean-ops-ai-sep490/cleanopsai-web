import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiToasts } from "@/lib/utils/toast-utils";
import {
  getSOPs,
  getSOPById,
  createSOP,
  updateSOP,
  deleteSOP,
} from "@/lib/sop-api";
import type { CreateSOPData, UpdateSOPData, SOP } from "@/types/sop";
import type { PaginationParams } from "@/types/common";

/**
 * Hook for fetching SOPs with pagination
 */
export function useSOPs(params?: PaginationParams) {
  return useQuery({
    queryKey: ["sops", params],
    queryFn: () => getSOPs(params),
  });
}

/**
 * Hook for fetching a single SOP by ID
 */
export function useSOP(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sops", id],
    queryFn: async () => {
      try {
        const result = await getSOPById(id);
        // Ensure we always return a value, never undefined
        return result || null;
      } catch (error: any) {
        // For 404 errors, throw a proper error instead of returning undefined
        if (error?.status === 404 || error?.message?.includes("404")) {
          throw new Error(`SOP with ID ${id} not found`);
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook for creating a new SOP
 */
export function useCreateSOP(onSuccess?: (sop: SOP) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSOP,
    onSuccess: (data) => {
      apiToasts.createSuccess("SOP");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      onSuccess?.(data);
    },
    onError: (error) => {
      apiToasts.createError("SOP");
      console.error("SOP creation error:", error);
    },
  });
}

/**
 * Hook for updating an existing SOP
 */
export function useUpdateSOP(onSuccess?: (sop: SOP) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSOPData }) =>
      updateSOP(id, data),
    onSuccess: (data, variables) => {
      apiToasts.updateSuccess("SOP");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      queryClient.invalidateQueries({ queryKey: ["sops", variables.id] });
      onSuccess?.(data);
    },
    onError: (error) => {
      apiToasts.updateError("SOP");
      console.error("SOP update error:", error);
    },
  });
}

/**
 * Hook for deleting a SOP
 */
export function useDeleteSOP(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSOP,
    onSuccess: (_, deletedId) => {
      apiToasts.deleteSuccess("SOP");
      // Remove the specific SOP from cache immediately
      queryClient.removeQueries({ queryKey: ["sops", deletedId] });
      // Cancel any outgoing queries for this SOP
      queryClient.cancelQueries({ queryKey: ["sops", deletedId] });
      // Invalidate the SOPs list to refresh it
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      onSuccess?.();
    },
    onError: (error) => {
      apiToasts.deleteError("SOP");
      console.error("SOP deletion error:", error);
    },
  });
}
