"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toastUtils } from "@/lib/utils/toast-utils";
import type {
  SLABasicInfo,
  SLAStaffRequirement,
  SLATaskRequirement,
} from "@/types/sla";
import { SLAService } from "@/lib/services/sla.service";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { StaffRequirementStep } from "./steps/StaffRequirementStep";
import { TaskRequirementStep } from "./steps/TaskRequirementStep";

interface Step {
  number: number;
  title: string;
  active: boolean;
}

export function SLACreateContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for all steps
  const [basicInfo, setBasicInfo] = useState<SLABasicInfo>({
    contractId: "",
    environmentTypeId: "",
    slaName: "",
    locationId: "",
    zoneId: "",
    workAreaId: "",
  });

  const [staffRequirements, setStaffRequirements] = useState<
    SLAStaffRequirement[]
  >([]);

  const [taskRequirements, setTaskRequirements] = useState<
    SLATaskRequirement[]
  >([]);

  const steps: Step[] = [
    { number: 1, title: "Thông tin cơ bản", active: currentStep === 1 },
    { number: 2, title: "Bố trí nhân sự", active: currentStep === 2 },
    { number: 3, title: "Cấu hình công việc", active: currentStep === 3 },
  ];

  // Memoize onChange functions to prevent unnecessary re-renders
  const handleBasicInfoChange = useCallback((newData: SLABasicInfo) => {
    setBasicInfo(newData);
  }, []);

  const handleStaffRequirementsChange = useCallback(
    (newData: SLAStaffRequirement[]) => {
      setStaffRequirements(newData);
    },
    [],
  );

  const handleTaskRequirementsChange = useCallback(
    (newData: SLATaskRequirement[]) => {
      setTaskRequirements(newData);
    },
    [],
  );

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Use SLAService to create complete SLA with proper time formatting
      await SLAService.createCompleteSLA(
        basicInfo,
        staffRequirements,
        taskRequirements,
      );

      toastUtils.success("Tạo SLA thành công!");
      router.push("/manager/sla-trigger");
    } catch (error) {
      console.error("Failed to create SLA:", error);
      toastUtils.error(
        error instanceof Error
          ? error.message
          : "Không thể tạo SLA. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          basicInfo.contractId &&
          basicInfo.environmentTypeId &&
          basicInfo.slaName &&
          basicInfo.locationId &&
          basicInfo.zoneId &&
          basicInfo.workAreaId
        );
      case 2:
        return staffRequirements.length > 0;
      case 3:
        return taskRequirements.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/manager/sla-trigger">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Manager
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-black">Tạo SLA Mới</h1>
        <p className="text-gray-600 mt-1">
          Thiết lập thỏa thuận về hợp đồng với khách hàng
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 py-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  step.active
                    ? "bg-primary"
                    : currentStep > step.number
                      ? "bg-primary"
                      : "bg-gray-300"
                }`}
              >
                {step.number}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${
                  step.active ? "text-primary" : "text-gray-600"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  currentStep > step.number ? "bg-primary" : "bg-gray-300"
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
            <BasicInfoStep data={basicInfo} onChange={handleBasicInfoChange} />
          )}

          {currentStep === 2 && (
            <StaffRequirementStep
              staffRequirements={staffRequirements}
              onStaffRequirementsChange={handleStaffRequirementsChange}
            />
          )}

          {currentStep === 3 && (
            <TaskRequirementStep
              taskRequirements={taskRequirements}
              onTaskRequirementsChange={handleTaskRequirementsChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isStepValid() || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tạo...
            </>
          ) : currentStep === 3 ? (
            "Tạo SLA"
          ) : (
            <>
              Tiếp tục
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
