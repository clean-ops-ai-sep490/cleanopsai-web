"use client";

import AuthGuard from "@/components/AuthGuard";
import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { SupervisorSidebar } from "@/components/layout/SupervisorSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AppShell } from "@/components/layout/AppShell";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard
        allowedRoles={[UserRole.Supervisor]}
        fallbackPath="/unauthorized"
      >
        <AppShell
          sidebar={<SupervisorSidebar />}
          header={<DashboardHeader />}
        >
          {children}
        </AppShell>
      </RoleGuard>
    </AuthGuard>
  );
}
