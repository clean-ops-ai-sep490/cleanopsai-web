"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  MultiStepForm,
  type StepDefinition,
} from "@/components/common/MultiStepForm";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useContractFormData } from "@/hooks/useContractFormData";
import { ContractForm } from "./ContractForm";
import { LocationForm } from "./LocationForm";
import { ZoneForm } from "./ZoneForm";
import { WorkAreaForm } from "./WorkAreaForm";

const STEP_IDS = ["contract", "location", "zone", "workarea"] as const;

export function ContractCreateContainer() {
  const router = useRouter();

  // Centralized data fetching
  const { clients, zones, clientsLoading, zonesLoading } =
    useContractFormData();

  const { activeStep, goToNextStep, goToStep } = useMultiStepForm({
    steps: [...STEP_IDS],
    initialStep: "contract",
    onComplete: () => router.push("/dashboard/contracts"),
  });

  const handleSuccess = () => {
    goToNextStep();
  };

  const handleCancel = () => {
    router.push("/dashboard/contracts");
  };

  const steps: StepDefinition[] = [
    {
      id: "contract",
      label: "Contract",
      title: "Contract Information",
      description:
        "Create a new contract with client information and upload contract documents.",
      content: (
        <ContractForm
          clients={clients}
          clientsLoading={clientsLoading}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ),
    },
    {
      id: "location",
      label: "Location",
      title: "Location Setup",
      description:
        "Add location details where the cleaning services will be performed.",
      content: (
        <LocationForm
          clients={clients}
          clientsLoading={clientsLoading}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ),
    },
    {
      id: "zone",
      label: "Zone",
      title: "Zone Configuration",
      description:
        "Define zones within the location for better organization of cleaning areas.",
      content: <ZoneForm onSuccess={handleSuccess} onCancel={handleCancel} />,
    },
    {
      id: "workarea",
      label: "Work Area",
      title: "Work Area Setup",
      description:
        "Create specific work areas within zones for detailed cleaning task assignment.",
      content: (
        <WorkAreaForm
          zones={zones}
          zonesLoading={zonesLoading}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Create Contract & Setup Locations
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo hợp đồng mới và thiết lập vị trí làm việc
            </p>
          </div>
        </div>
      </div>

      {/* Multi-step Form */}
      <MultiStepForm
        steps={steps}
        activeStep={activeStep}
        onStepChange={goToStep}
      />
    </div>
  );
}
