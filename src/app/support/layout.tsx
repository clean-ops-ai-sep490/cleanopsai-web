"use client";

import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { SupportSidebar } from "@/components/layout/SupportSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AppShell } from "@/components/layout/AppShell";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Supporter]}
      fallbackPath="/unauthorized"
    >
      <AppShell
        sidebar={<SupportSidebar />}
        header={<DashboardHeader />}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
