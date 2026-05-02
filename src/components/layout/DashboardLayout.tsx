"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import AuthGuard from "@/components/AuthGuard";
import RoleGuard, { UserRole } from "@/components/RoleGuard";

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function DashboardLayout({
  children,
  allowedRoles = [UserRole.Admin, UserRole.Manager],
}: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <RoleGuard
        allowedRoles={allowedRoles}
        fallbackPath="/unauthorized"
      >
        <div className="min-h-screen bg-[#f9fafb]">
          <Sidebar />
          <DashboardHeader />
          <main className="ml-[263px] mt-[106px] p-8">{children}</main>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
