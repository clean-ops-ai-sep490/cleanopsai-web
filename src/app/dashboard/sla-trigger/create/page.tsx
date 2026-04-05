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
  SLAStaffRequirement,
  SLATaskRequirement,
} from "@/types/sla";
import { createSLA, createSLAShift, createSLATask } from "@/lib/sla-api";
import { toast } from "sonner";

// Step Components
import { BasicInfoStep } from "@/components/sla/steps/BasicInfoStep";
import { StaffRequirementStep } from "@/components/sla/steps/StaffRequirementStep";

export default function CreateSLAPage() {
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

  const steps = [
    { number: 1, title: "Thông tin cơ bản", active: currentStep === 1 },
    { number: 2, title: "Bố trí nhân sự", active: currentStep === 2 },
    { number: 3, title: "Cấu hình công việc", active: currentStep === 3 },
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Create SLA first
      const slaData = {
        name: basicInfo.slaName,
        environmentTypeId: basicInfo.environmentTypeId,
        serviceType: "Cleaning" as const,
        workAreaId: basicInfo.workAreaId,
        contractId: basicInfo.contractId,
      };

      const createdSLA = await createSLA(slaData);

      // Create SLA Shifts
      const shiftPromises = staffRequirements.map((staff) =>
        createSLAShift({
          name: staff.name,
          slaId: createdSLA.id,
          startTime: staff.startTime,
          endTime: staff.endTime,
          requiredWorker: staff.requiredWorker,
          breakTime: staff.breakTime,
        }),
      );

      // Create SLA Tasks
      const taskPromises = taskRequirements.map((task) =>
        createSLATask({
          name: task.name,
          slaId: createdSLA.id,
          recurrenceType: task.recurrenceType,
          recurrenceConfig: task.recurrenceConfig,
        }),
      );

      await Promise.all([...shiftPromises, ...taskPromises]);

      toast.success("Tạo SLA thành công!");
      router.push("/dashboard/sla-trigger");
    } catch (error) {
      console.error("Failed to create SLA:", error);
      toast.error("Không thể tạo SLA. Vui lòng thử lại.");
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
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/sla-trigger">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-black">Tạo SLA Mới</h1>
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
              <StaffRequirementStep
                staffRequirements={staffRequirements}
                onStaffRequirementsChange={setStaffRequirements}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Cấu hình công việc
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thiết lập các công việc và lịch trình thực hiện
                  </p>
                </div>

                {taskRequirements.map((task, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTaskRequirements(
                            taskRequirements.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Lặp lại: {task.recurrenceType}
                    </p>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() =>
                    setTaskRequirements([
                      ...taskRequirements,
                      {
                        name: `Công việc ${taskRequirements.length + 1}`,
                        recurrenceType: "Daily",
                        recurrenceConfig: { interval: 1 },
                      },
                    ])
                  }
                >
                  Thêm công việc
                </Button>
              </div>
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
            className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
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
    </DashboardLayout>
  );
}
