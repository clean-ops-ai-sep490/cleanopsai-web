import { useQuery } from "@tanstack/react-query";
import { getSkillById } from "@/lib/skill-api";
import { getCertificationById } from "@/lib/certification-api";
import type { Skill, Certification } from "@/types/skill";

/**
 * Hook to fetch skills and certifications details from SOP requirements
 */
export function useSOPRequirements(
  requiredSkillIds: string[] = [],
  requiredCertificationIds: string[] = [],
) {
  // Fetch skills details
  const skillsQuery = useQuery({
    queryKey: ["sop-skills", requiredSkillIds],
    queryFn: async () => {
      if (!requiredSkillIds.length) return [];

      const skillPromises = requiredSkillIds.map((id) => getSkillById(id));
      const skills = await Promise.allSettled(skillPromises);

      return skills
        .filter(
          (result): result is PromiseFulfilledResult<Skill> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
    },
    enabled: requiredSkillIds.length > 0,
  });

  // Fetch certifications details
  const certificationsQuery = useQuery({
    queryKey: ["sop-certifications", requiredCertificationIds],
    queryFn: async () => {
      if (!requiredCertificationIds.length) return [];

      const certPromises = requiredCertificationIds.map((id) =>
        getCertificationById(id),
      );
      const certifications = await Promise.allSettled(certPromises);

      return certifications
        .filter(
          (result): result is PromiseFulfilledResult<Certification> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
    },
    enabled: requiredCertificationIds.length > 0,
  });

  return {
    // Skills data
    skills: skillsQuery.data || [],
    skillsLoading: skillsQuery.isLoading,
    skillsError: skillsQuery.error,

    // Certifications data
    certifications: certificationsQuery.data || [],
    certificationsLoading: certificationsQuery.isLoading,
    certificationsError: certificationsQuery.error,

    // Combined loading state
    isLoading: skillsQuery.isLoading || certificationsQuery.isLoading,

    // Combined error state
    hasError: !!skillsQuery.error || !!certificationsQuery.error,
  };
}
