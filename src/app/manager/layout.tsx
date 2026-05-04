"use client";

import AuthGuard from "@/components/AuthGuard";
import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AppShell } from "@/components/layout/AppShell";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard
        allowedRoles={[UserRole.Admin, UserRole.Manager]}
        fallbackPath="/unauthorized"
      >
        <AppShell
          sidebar={<Sidebar />}
          header={<DashboardHeader />}
        >
          {children}
        </AppShell>
      </RoleGuard>
    </AuthGuard>
  );
}
