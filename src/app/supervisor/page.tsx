"use client";


import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { LayoutDashboard } from "lucide-react";

export default function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Supervisor Dashboard" 
        description="Chào mừng bạn quay trở lại. Đây là nơi bạn quản lý các tác vụ giám sát." 
      />
      
      <SectionCard title="Tổng quan">
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <LayoutDashboard className="h-12 w-12 mb-4 opacity-20" />
          <p>Dữ liệu tổng quan đang được cập nhật...</p>
        </div>
      </SectionCard>
    </div>
  );
}
