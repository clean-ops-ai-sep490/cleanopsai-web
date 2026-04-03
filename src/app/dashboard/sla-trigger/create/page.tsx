"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type {
  SLABasicInfo,
  Zone,
  WorkArea,
  SLAStaffRequirement,
} from "@/types/sla";

// Step Components
import { BasicInfoStep } from "@/components/sla/steps/BasicInfoStep";
import { ZoneWorkStep } from "@/components/sla/steps/ZoneWorkStep";
import { StaffRequirementStep } from "@/components/sla/steps/StaffRequirementStep";

export default function CreateSLAPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data for all steps
  const [basicInfo, setBasicInfo] = useState<SLABasicInfo>({
    contractNumber: "",
    serviceType: "",
    slaName: "",
    environment: "",
  });

  const [zones, setZones] = useState<Zone[]>([]);
  const [workAreas, setWorkAreas] = useState<WorkArea[]>([]);
  const [staffRequirements, setStaffRequirements] = useState<
    SLAStaffRequirement[]
  >([]);

  const steps = [
    { number: 1, title: "Thông tin cơ bản", active: currentStep === 1 },
    { number: 2, title: "Khu vực và công việc", active: currentStep === 2 },
    { number: 3, title: "Bố trí nhân sự", active: currentStep === 3 },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit SLA
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const slaData = {
      basicInfo,
      zones,
      workAreas,
      staffRequirements,
    };

    console.log("Creating SLA:", slaData);

    // Simulate API call
    setTimeout(() => {
      router.push("/dashboard/sla-trigger");
    }, 1000);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          basicInfo.contractNumber &&
          basicInfo.serviceType &&
          basicInfo.slaName &&
          basicInfo.environment
        );
      case 2:
        return zones.length > 0 && workAreas.length > 0;
      case 3:
        return staffRequirements.length > 0;
      default:
        return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sla-trigger">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Tạo Trigger SLA
            </h1>
            <p className="text-gray-600 mt-1">
              Thiết lập thỏa thuận về hợp đồng với khách hàng
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8 py-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    step.active
                      ? "bg-[#1a80a2]"
                      : currentStep > step.number
                        ? "bg-[#1a80a2]"
                        : "bg-gray-300"
                  }`}
                >
                  {step.number}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    step.active ? "text-[#1a80a2]" : "text-gray-600"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-[#1a80a2]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <BasicInfoStep data={basicInfo} onChange={setBasicInfo} />
            )}

            {currentStep === 2 && (
              <ZoneWorkStep
                zones={zones}
                onZonesChange={setZones}
                workAreas={workAreas}
                onWorkAreasChange={setWorkAreas}
              />
            )}

            {currentStep === 3 && (
              <StaffRequirementStep
                staffRequirements={staffRequirements}
                onStaffRequirementsChange={setStaffRequirements}
                zones={zones}
                workAreas={workAreas}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
          >
            {currentStep === 3 ? "Tạo SLA" : "Tiếp tục"}
            {currentStep < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
