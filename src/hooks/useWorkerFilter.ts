import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSOP } from "./useSOPs";
import { useFilteredWorkers } from "./useWorkers";
import { getSkillById } from "@/lib/skill-api";
import { getCertificationById } from "@/lib/certification-api";
import type { Skill, Certification } from "@/types/skill";
import { WorkerFilterParams } from "@/lib/worker-api";

export interface WorkerFilterConfig {
  // SOP-based filtering
  sopId?: string;

  // Direct skill/certification filtering
  skillIds?: string[];
  certificationIds?: string[];

  // Location and time filtering
  address?: string;
  startAt?: string; // HH:MM:SS format
  endAt?: string; // HH:MM:SS format

  // Pagination
  pageNumber?: number;
  pageSize?: number;

  // Control flags
  enabled?: boolean;
  autoFilter?: boolean; // Auto-enable filtering when criteria exist
}

export interface WorkerFilterResult {
  // Workers data
  workers: any[];
  workersTotal: number;
  workersLoading: boolean;
  workersError: any;

  // SOP data (if sopId provided)
  sop: any;
  sopLoading: boolean;
  sopError: any;

  // Skills data (detailed information)
  requiredSkills: Skill[];
  skillsLoading: boolean;
  skillsError: any;

  // Certifications data (detailed information)
  requiredCertifications: Certification[];
  certificationsLoading: boolean;
  certificationsError: any;

  // Filter state
  hasActiveFilters: boolean;
  filterParams: WorkerFilterParams;

  // Combined states
  isLoading: boolean;
  hasError: boolean;

  // Helper methods
  getSkillNames: () => string[];
  getCertificationNames: () => string[];
  getFilterSummary: () => string;

  // Debug info
  debugInfo: {
    sopRequiredSkills: string[];
    sopRequiredCertifications: string[];
    directSkills: string[];
    directCertifications: string[];
    allSkillIds: string[];
    allCertificationIds: string[];
  };
}

/**
 * Comprehensive hook for filtering workers with multiple criteria
 * Supports SOP-based filtering, direct skill/certification filtering, and more
 */
export function useWorkerFilter(
  config: WorkerFilterConfig,
): WorkerFilterResult {
  const {
    sopId,
    skillIds = [],
    certificationIds = [],
    address,
    startAt,
    endAt,
    pageNumber,
    pageSize,
    enabled = true,
    autoFilter = true,
  } = config;

  // 1. Fetch SOP data if sopId provided
  const {
    data: sopData,
    isLoading: sopLoading,
    error: sopError,
  } = useSOP(sopId || "", { enabled: !!sopId && enabled });

  // 2. Combine all skill and certification IDs
  const allSkillIds = useMemo(() => {
    const sopSkills = sopData?.requiredSkillIds || [];
    return [...new Set([...sopSkills, ...skillIds])];
  }, [sopData?.requiredSkillIds, skillIds]);

  const allCertificationIds = useMemo(() => {
    const sopCertifications = sopData?.requiredCertificationIds || [];
    return [...new Set([...sopCertifications, ...certificationIds])];
  }, [sopData?.requiredCertificationIds, certificationIds]);

  // 3. Fetch detailed skills information
  const skillsQuery = useQuery({
    queryKey: ["worker-filter-skills", allSkillIds],
    queryFn: async () => {
      if (!allSkillIds.length) return [];

      const skillPromises = allSkillIds.map(async (id) => {
        try {
          return await getSkillById(id);
        } catch (error) {
          console.warn(`Failed to fetch skill ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(skillPromises);
      return results.filter((skill): skill is Skill => skill !== null);
    },
    enabled: enabled && allSkillIds.length > 0,
  });

  // 4. Fetch detailed certifications information
  const certificationsQuery = useQuery({
    queryKey: ["worker-filter-certifications", allCertificationIds],
    queryFn: async () => {
      if (!allCertificationIds.length) return [];

      const certPromises = allCertificationIds.map(async (id) => {
        try {
          return await getCertificationById(id);
        } catch (error) {
          console.warn(`Failed to fetch certification ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(certPromises);
      return results.filter((cert): cert is Certification => cert !== null);
    },
    enabled: enabled && allCertificationIds.length > 0,
  });

  // 5. Prepare worker filter parameters
  const workerFilterParams: WorkerFilterParams = useMemo(() => {
    const params: WorkerFilterParams = {};

    // Location filter
    if (address?.trim()) {
      params.address = address.trim();
    }

    // Time range filters
    if (startAt) params.startAt = startAt;
    if (endAt) params.endAt = endAt;

    // Pagination
    if (pageNumber) params.pageNumber = pageNumber;
    if (pageSize) params.pageSize = pageSize;

    // Skill categories (use IDs as categories)
    if (allSkillIds.length > 0) {
      params.skillCategories = allSkillIds;
    }

    // Certification categories (use IDs as categories)
    if (allCertificationIds.length > 0) {
      params.certificateCategories = allCertificationIds;
    }

    return params;
  }, [
    allSkillIds,
    allCertificationIds,
    address,
    startAt,
    endAt,
    pageNumber,
    pageSize,
  ]);

  // 6. Determine if filtering should be active
  const hasActiveFilters = useMemo(() => {
    if (!enabled) return false;

    if (autoFilter) {
      return !!(
        allSkillIds.length > 0 ||
        allCertificationIds.length > 0 ||
        address?.trim() ||
        startAt ||
        endAt
      );
    }

    return true;
  }, [
    enabled,
    autoFilter,
    allSkillIds.length,
    allCertificationIds.length,
    address,
    startAt,
    endAt,
  ]);

  // 7. Filter workers
  const {
    data: workersData,
    isLoading: workersLoading,
    error: workersError,
  } = useFilteredWorkers(workerFilterParams, hasActiveFilters);

  // 8. Helper methods
  const getSkillNames = () =>
    skillsQuery.data?.map((skill) => skill.name) || [];
  const getCertificationNames = () =>
    certificationsQuery.data?.map((cert) => cert.name) || [];

  const getFilterSummary = () => {
    const parts: string[] = [];

    if (allSkillIds.length > 0) {
      parts.push(`${allSkillIds.length} kỹ năng`);
    }

    if (allCertificationIds.length > 0) {
      parts.push(`${allCertificationIds.length} chứng chỉ`);
    }

    if (address?.trim()) {
      parts.push(`địa chỉ: ${address.trim()}`);
    }

    if (startAt && endAt) {
      parts.push(`thời gian: ${startAt}-${endAt}`);
    }

    return parts.length > 0 ? parts.join(", ") : "Không có bộ lọc";
  };

  // 9. Debug information
  const debugInfo = {
    sopRequiredSkills: sopData?.requiredSkillIds || [],
    sopRequiredCertifications: sopData?.requiredCertificationIds || [],
    directSkills: skillIds,
    directCertifications: certificationIds,
    allSkillIds,
    allCertificationIds,
  };

  // 10. Return comprehensive result
  return {
    // Workers data
    workers: workersData?.content || [],
    workersTotal: workersData?.totalElements || 0,
    workersLoading,
    workersError,

    // SOP data
    sop: sopData,
    sopLoading,
    sopError,

    // Skills data
    requiredSkills: skillsQuery.data || [],
    skillsLoading: skillsQuery.isLoading,
    skillsError: skillsQuery.error,

    // Certifications data
    requiredCertifications: certificationsQuery.data || [],
    certificationsLoading: certificationsQuery.isLoading,
    certificationsError: certificationsQuery.error,

    // Filter state
    hasActiveFilters,
    filterParams: workerFilterParams,

    // Combined states
    isLoading:
      sopLoading ||
      skillsQuery.isLoading ||
      certificationsQuery.isLoading ||
      workersLoading,
    hasError:
      !!sopError ||
      !!skillsQuery.error ||
      !!certificationsQuery.error ||
      !!workersError,

    // Helper methods
    getSkillNames,
    getCertificationNames,
    getFilterSummary,

    // Debug info
    debugInfo,
  };
}
