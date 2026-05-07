"use client";

import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.Admin]} fallbackPath="/unauthorized">
      <AppShell
        sidebar={<AdminSidebar />}
        header={<DashboardHeader />}
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}
