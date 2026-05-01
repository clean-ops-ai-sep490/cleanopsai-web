"use client";

import { Suspense } from "react";
import { AiRetrainContainer } from "@/components/ai-retrain/AiRetrainContainer";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserRole } from "@/components/RoleGuard";

export default function AiRetrainPage() {
  return (
    <DashboardLayout
      allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Supervisor]}
    >
      <Suspense fallback={null}>
        <AiRetrainContainer />
      </Suspense>
    </DashboardLayout>
  );
}
