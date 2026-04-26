"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WorkflowCreateContainer } from "@/components/workflow/WorkflowCreateContainer";

export default function WorkflowCreatePage() {
  return (
    <DashboardLayout>
      <WorkflowCreateContainer />
    </DashboardLayout>
  );
}
