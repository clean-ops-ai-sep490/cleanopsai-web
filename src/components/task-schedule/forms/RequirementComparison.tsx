"use client";

import { useQuery } from "@tanstack/react-query";
import { getRequirementsByIds } from "@/lib/certification-api";
import { getSkillsByWorkerId } from "@/lib/skill-api";
import { getCertificationsByWorkerId } from "@/lib/certification-api";
import { CheckCircle2, XCircle, Loader2, Award, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequirementComparisonProps {
  requiredSkillIds?: string[];
  requiredCertificationIds?: string[];
  workerId?: string;
}

export function RequirementComparison({
  requiredSkillIds = [],
  requiredCertificationIds = [],
  workerId,
}: RequirementComparisonProps) {
  // 1. Fetch details of required skills and certifications from SOP
  const { data: requirements, isLoading: loadingReqs } = useQuery({
    queryKey: ["requirements-details", requiredSkillIds, requiredCertificationIds],
    queryFn: () => getRequirementsByIds({ 
      skillIds: requiredSkillIds, 
      certificationIds: requiredCertificationIds 
    }),
    enabled: requiredSkillIds.length > 0 || requiredCertificationIds.length > 0,
  });

  // 2. Fetch worker's skills
  const { data: workerSkills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ["worker-skills", workerId],
    queryFn: () => getSkillsByWorkerId(workerId!),
    enabled: !!workerId,
  });

  // 3. Fetch worker's certifications
  const { data: workerCerts = [], isLoading: loadingCerts } = useQuery({
    queryKey: ["worker-certs", workerId],
    queryFn: () => getCertificationsByWorkerId(workerId!),
    enabled: !!workerId,
  });

  const isLoading = loadingReqs || loadingSkills || loadingCerts;

  if (!requiredSkillIds.length && !requiredCertificationIds.length) {
    return null;
  }

  const hasRequirements = (requirements?.skills?.length ?? 0) > 0 || (requirements?.certifications?.length ?? 0) > 0;

  if (!hasRequirements && !loadingReqs) return null;

  const checkHasSkill = (skillId: string) => {
    return workerSkills.some((s: any) => (s.skillId || s.id) === skillId);
  };

  const checkHasCert = (certId: string) => {
    return workerCerts.some((c: any) => (c.certificationId || c.id) === certId);
  };

  return (
    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Award className="w-4 h-4 text-blue-600" />
        Kiểm tra năng lực công việc
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Skills Section */}
        {requirements?.skills && requirements.skills.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3 h-3" />
              Kỹ năng yêu cầu
            </div>
            <div className="flex flex-wrap gap-2">
              {requirements.skills.map((skill: any) => {
                const hasIt = workerId ? checkHasSkill(skill.skillId || skill.id) : null;
                return (
                  <Badge
                    key={skill.skillId || skill.id}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 px-3 transition-all border-2",
                      workerId 
                        ? hasIt 
                          ? "bg-green-50 text-green-700 border-green-200 shadow-sm" 
                          : "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {workerId && (
                      hasIt 
                        ? <CheckCircle2 className="w-3.5 h-3.5" /> 
                        : <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="font-medium">{skill.name}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {requirements?.certifications && requirements.certifications.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3 h-3" />
              Chứng chỉ yêu cầu
            </div>
            <div className="flex flex-wrap gap-2">
              {requirements.certifications.map((cert: any) => {
                const hasIt = workerId ? checkHasCert(cert.certificationId || cert.id) : null;
                return (
                  <Badge
                    key={cert.certificationId || cert.id}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1.5 py-1.5 px-3 transition-all border-2",
                      workerId 
                        ? hasIt 
                          ? "bg-green-50 text-green-700 border-green-200 shadow-sm" 
                          : "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {workerId && (
                      hasIt 
                        ? <CheckCircle2 className="w-3.5 h-3.5" /> 
                        : <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="font-medium">{cert.name}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang tải thông tin đối soát...
        </div>
      )}
      
      {!workerId && hasRequirements && (
        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
          * Chọn nhân viên để đối soát kỹ năng và chứng chỉ thực tế.
        </p>
      )}
    </div>
  );
}
