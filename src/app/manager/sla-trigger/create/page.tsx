"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SLACreateContainer } from "@/components/sla/SLACreateContainer";

export default function CreateSLAPage() {
  return (
    <DashboardLayout>
      <SLACreateContainer />
    </DashboardLayout>
  );
}
