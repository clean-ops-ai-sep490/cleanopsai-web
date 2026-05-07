import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  filterWorkers,
  type WorkerFilterParams,
  type Worker,
} from "@/lib/worker-api";
import { useSOP } from "./useSOPs";

export interface TaskScheduleWorkerFilterConfig {
  // Form data from task-schedule
  sopId?: string;
  slaShiftStartTime?: string; // HH:MM:SS format
  slaShiftEndTime?: string; // HH:MM:SS format
  locationAddress?: string; // From selected location

  // Search criteria
  addressSearch?: string; // User input for address search

  // Control
  enabled?: boolean;
}

export interface TaskScheduleWorkerResult {
  workers: Worker[];
  isLoading: boolean;
  error: any;

  // Helper methods
  selectWorker: (workerId: string) => Worker | undefined;
  getWorkersBySkills: () => Worker[];
  getWorkersByLocation: () => Worker[];
}

/**
 * Hook để lấy workers phù hợp cho task schedule
 * Tự động filter dựa trên SOP requirements và thông tin từ forms
 */
export function useTaskScheduleWorkers(
  config: TaskScheduleWorkerFilterConfig,
): TaskScheduleWorkerResult {
  const {
    sopId,
    slaShiftStartTime,
    slaShiftEndTime,
    locationAddress,
    addressSearch,
    enabled = true,
  } = config;

  // Lấy thông tin SOP để có skill/certification requirements
  const { data: sopData, isLoading: sopLoading } = useSOP(sopId || "", {
    enabled: !!sopId && enabled,
  });

  // Tạo filter parameters từ thông tin forms
  const filterParams: WorkerFilterParams = useMemo(() => {
    const params: WorkerFilterParams = {
      pageNumber: 1,
      pageSize: 50, // Lấy nhiều để có nhiều lựa chọn
    };

    // Address filter - ưu tiên user search, fallback to location address
    const addressToUse = addressSearch?.trim() || locationAddress;
    if (addressToUse) {
      params.address = addressToUse;
    }

    // Time filter từ SLA shift
    if (slaShiftStartTime) params.startAt = slaShiftStartTime;
    if (slaShiftEndTime) params.endAt = slaShiftEndTime;

    // Skill/certification filter từ SOP
    if (sopData?.requiredSkillIds?.length) {
      params.skillCategories = sopData.requiredSkillIds;
    }
    if (sopData?.requiredCertificationIds?.length) {
      params.certificateCategories = sopData.requiredCertificationIds;
    }

    return params;
  }, [
    addressSearch,
    locationAddress,
    slaShiftStartTime,
    slaShiftEndTime,
    sopData?.requiredSkillIds,
    sopData?.requiredCertificationIds,
  ]);

  // Chỉ filter khi có ít nhất 1 criteria hoặc luôn cho phép lấy tất cả workers
  const shouldFilter = useMemo(() => {
    const hasAnyFilter = !!(
      filterParams.address ||
      filterParams.startAt ||
      filterParams.endAt ||
      filterParams.skillCategories?.length ||
      filterParams.certificateCategories?.length
    );

    // CHỈ cho phép query khi có ít nhất 1 filter criteria
    return hasAnyFilter;
  }, [filterParams]);

  // Query workers
  const {
    data: workersData,
    isLoading: workersLoading,
    error,
  } = useQuery({
    queryKey: ["task-schedule-workers", filterParams],
    queryFn: () => filterWorkers(filterParams),
    enabled: enabled && shouldFilter,
  });

  // Helper methods
  const selectWorker = (workerId: string): Worker | undefined => {
    if (!workersData) return undefined;

    // Handle both array and object with content
    const workers = Array.isArray(workersData)
      ? workersData
      : workersData.content;
    if (!workers || !Array.isArray(workers)) return undefined;

    return workers.find((worker) => worker.id === workerId);
  };

  const getWorkersBySkills = (): Worker[] => {
    if (!sopData?.requiredSkillIds?.length) {
      const workers = Array.isArray(workersData)
        ? workersData
        : workersData?.content || [];
      return workers || [];
    }
    // Trả về tất cả workers vì API đã filter theo skills rồi
    const workers = Array.isArray(workersData)
      ? workersData
      : workersData?.content || [];
    return workers || [];
  };

  const getWorkersByLocation = (): Worker[] => {
    if (!filterParams.address) {
      const workers = Array.isArray(workersData)
        ? workersData
        : workersData?.content || [];
      return workers || [];
    }
    // Trả về tất cả workers vì API đã filter theo address rồi
    const workers = Array.isArray(workersData)
      ? workersData
      : workersData?.content || [];
    return workers || [];
  };

  return {
    workers: Array.isArray(workersData)
      ? workersData
      : workersData?.content || [],
    isLoading: sopLoading || workersLoading,
    error,

    // Helper methods
    selectWorker,
    getWorkersBySkills,
    getWorkersByLocation,
  };
}
