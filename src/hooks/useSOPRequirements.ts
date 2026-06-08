import { useQuery } from "@tanstack/react-query";
import { getRequirementsByIds } from "@/lib/certification-api";
import type { Skill, Certification } from "@/types/skill";

/**
 * Hook to fetch skills and certifications details from SOP requirements
 */
export function useSOPRequirements(
  requiredSkillIds: string[] = [],
  requiredCertificationIds: string[] = [],
) {
  const query = useQuery({
    queryKey: ["sop-requirements-details", requiredSkillIds, requiredCertificationIds],
    queryFn: () =>
      getRequirementsByIds({
        skillIds: requiredSkillIds,
        certificationIds: requiredCertificationIds,
      }),
    enabled: requiredSkillIds.length > 0 || requiredCertificationIds.length > 0,
  });

  return {
    // Skills data
    skills: query.data?.skills || [],
    skillsLoading: query.isLoading,
    skillsError: query.error,

    // Certifications data
    certifications: query.data?.certifications || [],
    certificationsLoading: query.isLoading,
    certificationsError: query.error,

    // Combined loading state
    isLoading: query.isLoading,

    // Combined error state
    hasError: !!query.error,
  };
}

