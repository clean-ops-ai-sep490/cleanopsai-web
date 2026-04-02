"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar />
      <DashboardHeader />
      <main className="ml-[200px] mt-[106px] p-8">{children}</main>
    </div>
  );
}
