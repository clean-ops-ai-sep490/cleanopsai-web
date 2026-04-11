"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContractCreateContainer } from "@/components/contracts/ContractCreateContainer";

export default function CreateContractPage() {
  return (
    <DashboardLayout>
      <ContractCreateContainer />
    </DashboardLayout>
  );
}
