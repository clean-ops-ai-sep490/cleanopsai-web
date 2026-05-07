import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupervisorsPaginated,
  getWorkAreaSupervisorAssignments,
  assignSupervisorToWorkArea,
  unassignSupervisorFromWorkArea,
  getAvailableSupervisors,
  getWorkAreaSupervisorsByWorkArea,
  getAuthSupervisors,
} from "@/lib/supervisor-api";
import type { PaginatedRequest } from "@/types/common";
import type { AssignSupervisorToWorkAreaData } from "@/types/supervisor";
import { toastUtils } from "@/lib/utils/toast-utils";

// Get supervisors with pagination
export function useSupervisors(params?: PaginatedRequest) {
  return useQuery({
    queryKey: ["supervisors", params],
    queryFn: () => getSupervisorsPaginated(params?.pageNumber, params?.pageSize, params),
  });
}

// Get supervisors from auth API
export function useAuthSupervisors(params?: PaginatedRequest) {
  return useQuery({
    queryKey: ["authSupervisors", params],
    queryFn: () => getAuthSupervisors(params),
  });
}

// Get work area supervisor assignments
export function useWorkAreaSupervisorAssignments(params?: PaginatedRequest) {
  return useQuery({
    queryKey: ["workAreaSupervisorAssignments", params],
    queryFn: () => getWorkAreaSupervisorAssignments(params),
  });
}

// Get available supervisors (not assigned to any work area)
export function useAvailableSupervisors() {
  return useQuery({
    queryKey: ["availableSupervisors"],
    queryFn: getAvailableSupervisors,
  });
}

// Get supervisors assigned to a specific work area
export function useWorkAreaSupervisors(workAreaId: string) {
  return useQuery({
    queryKey: ["workAreaSupervisors", workAreaId],
    queryFn: () => getWorkAreaSupervisorsByWorkArea(workAreaId),
    enabled: !!workAreaId,
  });
}

// Assign supervisor to work area
export function useAssignSupervisorToWorkArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignSupervisorToWorkArea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workAreaSupervisorAssignments"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSupervisors"] });
      queryClient.invalidateQueries({ queryKey: ["workAreaSupervisors"] });
      toastUtils.success("Phân công giám sát viên thành công!");
    },
    onError: (error: any) => {
      toastUtils.error(
        error?.message ||
          "Không thể phân công giám sát viên. Vui lòng thử lại.",
      );
    },
  });
}

// Unassign supervisor from work area
export function useUnassignSupervisorFromWorkArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassignSupervisorFromWorkArea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workAreaSupervisorAssignments"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSupervisors"] });
      queryClient.invalidateQueries({ queryKey: ["workAreaSupervisors"] });
      toastUtils.success("Hủy phân công giám sát viên thành công!");
    },
    onError: (error: any) => {
      toastUtils.error(
        error?.message ||
          "Không thể hủy phân công giám sát viên. Vui lòng thử lại.",
      );
    },
  });
}
