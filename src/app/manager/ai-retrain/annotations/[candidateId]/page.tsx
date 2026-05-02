"use client";

import { AnnotationEditor } from "@/components/ai-retrain/AnnotationEditor";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserRole } from "@/components/RoleGuard";

export default function AnnotationCandidatePage() {
  return (
    <DashboardLayout
      allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Supervisor]}
    >
      <AnnotationEditor />
    </DashboardLayout>
  );
}
