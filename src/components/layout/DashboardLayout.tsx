"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Sidebar />
      <main className="ml-[263px] p-8">{children}</main>
    </div>
  );
}
