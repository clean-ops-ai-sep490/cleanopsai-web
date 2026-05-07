"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateSOP, useSOP } from "@/hooks/useSOPs";
import { useSteps } from "@/hooks/useSteps";
import { WorkflowForm, type SOPFormData } from "./WorkflowForm";
import { ActionRegistry } from "./ActionRegistry";
import { WorkflowStepList, type WorkflowStep } from "./WorkflowStepList";
import { CreateSOPData, Step } from "@/types/sop";

export function WorkflowCreateContainer({ sopId }: { sopId?: string }) {
  const router = useRouter();
  const isEditMode = !!sopId;

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [formData, setFormData] = useState<SOPFormData>({
    name: "",
    description: "",
    serviceType: "Cleaning",
    environmentTypeId: "",
    requiredSkillIds: [],
    requiredCertificationIds: [],
  });

  // API hooks
  const { data: availableSteps, isLoading: stepsLoading } = useSteps();
  const { data: existingSOP, isLoading: sopLoading } = useSOP(sopId!, {
    enabled: isEditMode,
  });

  const createSOPMutation = useCreateSOP((sop) => {
    router.push(`/manager/workflow/${sop.id}`);
  });

  // Load existing SOP data when in edit mode
  useEffect(() => {
    if (isEditMode && existingSOP && availableSteps?.content) {
      // Load form data
      setFormData({
        name: existingSOP.name,
        description: existingSOP.description || "",
        serviceType: existingSOP.serviceType || "Cleaning",
        environmentTypeId: existingSOP.environmentTypeId,
        requiredSkillIds: existingSOP.requiredSkillIds || [],
        requiredCertificationIds: existingSOP.requiredCertificationIds || [],
      });

      // Load workflow steps
      if (existingSOP.sopSteps) {
        const loadedSteps: WorkflowStep[] = existingSOP.sopSteps
          .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
          .map((sopStep: any) => {
            // Find the corresponding step from available steps
            const stepInfo = availableSteps.content.find(
              (s: any) => s.id === sopStep.stepId,
            );

            return {
              id: sopStep.id, // Use sopStep ID for UI
              stepId: sopStep.stepId, // Original step ID for API
              name: stepInfo?.name || `Step ${sopStep.stepOrder}`,
              description: stepInfo?.description || "",
              actionKey: stepInfo?.actionKey || "unknown",
              configSchema: stepInfo?.configSchema || "{}",
              configDetail: sopStep.configDetail || {},
              order: sopStep.stepOrder,
            };
          });

        setWorkflowSteps(loadedSteps);
      }
    }
  }, [isEditMode, existingSOP, availableSteps]);

  // Available steps from API for Action Registry
  const actionRegistry = availableSteps?.content || [];

  // Generate configDetail based on actionKey
  const generateConfigDetail = (actionKey: string): any => {
    switch (actionKey.toLowerCase()) {
      case "equipment-check":
        return { requiredEquipment: [] };
      case "ppe-check":
      case "ai-ppe-check":
        return { requiredPPE: [] };
      case "photo-capture":
        return { phase: "before", minPhotos: 5 };
      case "checkin":
        return { method: "qr" };
      case "checklist":
        return { items: [] };
      case "list":
        return { items: [] };
      case "note":
        return { requireNote: true };
      default:
        return {};
    }
  };

  const addStep = (step: Step) => {
    // Kiểm tra step đã tồn tại (trừ photo-capture)
    if (step.actionKey.toLowerCase() !== "photo-capture") {
      const existingStep = workflowSteps.find(
        (s) => s.actionKey.toLowerCase() === step.actionKey.toLowerCase(),
      );
      if (existingStep) {
        alert(
          `Step "${step.name}" đã được thêm vào workflow. Mỗi loại step chỉ được thêm một lần (trừ step Chụp ảnh).`,
        );
        return;
      }
    } else {
      // Đối với photo-capture, kiểm tra số lượng và phase
      const photoSteps = workflowSteps.filter(
        (s) => s.actionKey.toLowerCase() === "photo-capture",
      );
      if (photoSteps.length >= 2) {
        alert(`Step "Chụp ảnh" chỉ được thêm tối đa 2 lần (Before và After).`);
        return;
      }
    }

    // Generate config detail with smart defaults
    let configDetail = generateConfigDetail(step.actionKey);

    // For photo-capture, auto-assign phase based on existing steps
    if (step.actionKey.toLowerCase() === "photo-capture") {
      const existingPhotoSteps = workflowSteps.filter(
        (s) => s.actionKey.toLowerCase() === "photo-capture",
      );

      if (existingPhotoSteps.length > 0) {
        // If there's already a photo-capture step, check its phase
        const existingPhase =
          existingPhotoSteps[0].configDetail?.phase || "before";
        // Assign the opposite phase
        configDetail = {
          ...configDetail,
          phase: existingPhase === "before" ? "after" : "before",
        };
      }
    }

    const newStep: WorkflowStep = {
      id: `${step.id}-${Date.now()}-${Math.random()}`, // Generate unique ID for UI
      stepId: step.id, // Store the original step ID for API calls
      name: step.name,
      description: step.description,
      actionKey: step.actionKey,
      configSchema: step.configSchema,
      configDetail: configDetail,
      order: workflowSteps.length + 1, // Start from 1 instead of 0
    };
    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (id: string) => {
    const filteredSteps = workflowSteps.filter((step) => step.id !== id);
    // Cập nhật lại số thứ tự sau khi xóa
    const reorderedSteps = filteredSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
    setWorkflowSteps(reorderedSteps);
  };

  const updateStepName = (id: string, name: string) => {
    setWorkflowSteps(
      workflowSteps.map((step) => (step.id === id ? { ...step, name } : step)),
    );
  };

  const updateStepDescription = (id: string, description: string) => {
    setWorkflowSteps(
      workflowSteps.map((step) =>
        step.id === id ? { ...step, description } : step,
      ),
    );
  };

  const updateStepConfigDetail = (id: string, configDetail: any) => {
    setWorkflowSteps(
      workflowSteps.map((step) =>
        step.id === id ? { ...step, configDetail } : step,
      ),
    );
  };

  const reorderSteps = (fromIndex: number, toIndex: number) => {
    const newSteps = [...workflowSteps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    // Update order numbers and auto-update photo-capture phases based on position
    const reorderedSteps = newSteps.map((step, index) => {
      const updatedStep = {
        ...step,
        order: index + 1,
      };

      // Auto-update phase for photo-capture steps based on their order
      if (step.actionKey.toLowerCase() === "photo-capture") {
        const photoSteps = newSteps.filter(
          (s) => s.actionKey.toLowerCase() === "photo-capture",
        );

        if (photoSteps.length === 2) {
          // Find the position of this step among photo-capture steps
          const photoIndex = photoSteps.findIndex((s) => s.id === step.id);
          // First photo-capture step = "before", second = "after"
          updatedStep.configDetail = {
            ...step.configDetail,
            phase: photoIndex === 0 ? "before" : "after",
          };
        }
      }

      return updatedStep;
    });

    setWorkflowSteps(reorderedSteps);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên SOP");
      return;
    }

    if (!formData.environmentTypeId.trim()) {
      alert("Vui lòng nhập ID môi trường");
      return;
    }

    if (workflowSteps.length === 0) {
      alert("Vui lòng thêm ít nhất một bước");
      return;
    }

    try {
      // Use existing steps (no need to create new ones since we're using steps from API)
      const sopSteps = workflowSteps.map((step) => ({
        stepId: step.stepId, // Use the original step ID from API
        stepOrder: step.order, // This will start from 1
        configDetail: step.configDetail, // Send clean object directly to API
      }));

      // Create SOP with step references
      const sopData: CreateSOPData = {
        name: formData.name,
        description: formData.description || undefined,
        serviceType: formData.serviceType,
        environmentTypeId: formData.environmentTypeId,
        steps: sopSteps,
        requiredSkillIds: formData.requiredSkillIds,
        requiredCertificationIds: formData.requiredCertificationIds,
      };

      await createSOPMutation.mutateAsync(sopData);
    } catch (error) {
      console.error("Failed to create SOP:", error);
    }
  };

  const isLoading =
    createSOPMutation.isPending || stepsLoading || (isEditMode && sopLoading);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-medium text-black mb-2">
          {isEditMode ? "Chỉnh sửa SOP Workflow" : "Tạo SOP Workflow mới"}
        </h1>
        <p className="text-sm text-[#70808f]">
          {isEditMode
            ? "Cập nhật quy trình SOP cho môi trường làm việc"
            : "Thiết kế quy trình SOP cho môi trường làm việc"}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Action Registry - Left Sidebar */}
        <ActionRegistry
          steps={actionRegistry}
          isLoading={stepsLoading}
          onAddStep={addStep}
          workflowSteps={workflowSteps}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* SOP Information */}
          <WorkflowForm formData={formData} onChange={setFormData} />

          {/* Dynamic Workflow Configuration */}
          <WorkflowStepList
            steps={workflowSteps}
            onUpdateStepName={updateStepName}
            onUpdateStepDescription={updateStepDescription}
            onUpdateStepConfigDetail={updateStepConfigDetail}
            onRemoveStep={removeStep}
            onReorderSteps={reorderSteps}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="bg-white border-[#e5e5e5] text-[#70808f] h-[45px] w-[130px] rounded-[5px] text-lg font-semibold hover:bg-gray-50"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Hủy bỏ
            </Button>
            <Button
              className="bg-primary hover:bg-[#308cab] text-white h-[45px] w-[170px] rounded-[5px] text-lg font-semibold disabled:opacity-50"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : isEditMode ? (
                "Cập nhật SOP"
              ) : (
                "Tạo SOP"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
