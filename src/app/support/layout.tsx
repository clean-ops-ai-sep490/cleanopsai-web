"use client";

import RoleGuard, { UserRole } from "@/components/RoleGuard";
import { SupportSidebar } from "@/components/layout/SupportSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Supporter]} fallbackPath="/unauthorized">
      <div className="min-h-screen bg-[#f9fafb]">
        <SupportSidebar />
        <DashboardHeader />
        <main className="ml-[263px] mt-[106px] p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}
