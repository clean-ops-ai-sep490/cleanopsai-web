"use client";

import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.Admin]} fallbackPath="/unauthorized">
      <div className="min-h-screen bg-[#f9fafb]">
        <AdminSidebar />
        <DashboardHeader />
        <main className="ml-[263px] mt-[106px] p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
