"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { PhotoCaptureConfig } from "./configs/PhotoCaptureConfig";
import { CheckInConfig } from "./configs/CheckInConfig";
import { FinishConfig } from "./configs/FinishConfig";
import { EquipmentCheckConfig } from "./configs/EquipmentCheckConfig";
import { PPECheckConfig } from "./configs/PPECheckConfig";
import { ListItemsConfig } from "./configs/ListItemsConfig";
import { getStepIcon } from "./utils/stepIcons";

export interface WorkflowStep {
  id: string;
  stepId: string; // Original step ID from API for API calls
  name: string;
  description: string;
  actionKey: string;
  configSchema: string;
  configDetail?: any;
  order: number;
}

interface WorkflowStepListProps {
  steps: WorkflowStep[];
  onUpdateStepName: (id: string, name: string) => void;
  onUpdateStepDescription: (id: string, description: string) => void;
  onUpdateStepConfigDetail: (id: string, configDetail: any) => void;
  onRemoveStep: (id: string) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
}

// Helper function to ensure configDetail is always an object, not a string
const getConfigDetail = (step: WorkflowStep) => {
  let configDetail = step.configDetail;
  if (typeof configDetail === "string") {
    try {
      configDetail = JSON.parse(configDetail);
    } catch {
      configDetail = {};
    }
  }
  return configDetail || {};
};

export function WorkflowStepList({
  steps,
  onUpdateStepName,
  onUpdateStepDescription,
  onUpdateStepConfigDetail,
  onRemoveStep,
  onReorderSteps,
}: WorkflowStepListProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [jsonPreviewSteps, setJsonPreviewSteps] = useState<Set<string>>(
    new Set(),
  );

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleJsonPreview = (stepId: string) => {
    const newJsonPreview = new Set(jsonPreviewSteps);
    if (newJsonPreview.has(stepId)) {
      newJsonPreview.delete(stepId);
    } else {
      newJsonPreview.add(stepId);
    }
    setJsonPreviewSteps(newJsonPreview);
  };

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", stepId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    const draggedStepId = e.dataTransfer.getData("text/plain");
    if (!draggedStepId || draggedStepId === targetStepId) return;

    const draggedIndex = steps.findIndex((step) => step.id === draggedStepId);
    const targetIndex = steps.findIndex((step) => step.id === targetStepId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      onReorderSteps(draggedIndex, targetIndex);
    }
  };

  const renderStepConfig = (step: WorkflowStep) => {
    const actionKey = step.actionKey.toLowerCase();

    switch (actionKey) {
      case "checkin":
        return (
          <CheckInConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
          />
        );
      case "finish":
        return (
          <FinishConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
          />
        );
      case "equipment-check":
        return (
          <EquipmentCheckConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
          />
        );
      case "ppe-check":
      case "ai-ppe-check":
        return (
          <PPECheckConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
          />
        );
      case "photo-capture":
        return (
          <PhotoCaptureConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
            allSteps={steps}
          />
        );
      case "checklist":
        return (
          <ListItemsConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
            title="Danh sách bước"
            itemPlaceholder="Nhập bước..."
            addButtonText="Thêm bước"
          />
        );
      case "list":
        return (
          <ListItemsConfig
            step={step}
            onUpdateStepConfigDetail={onUpdateStepConfigDetail}
            title="Nội dung đọc để nắm"
            description="Worker chỉ cần đọc, không cần check — mang tính thông tin"
            itemPlaceholder="Nhập nội dung..."
            addButtonText="Thêm nội dung"
          />
        );
      default:
        return (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-900">
              Cấu hình tùy chỉnh
            </Label>
            <p className="text-sm text-gray-600">
              Step này chưa có form cấu hình. Manager có thể cấu hình thông qua
              JSON.
            </p>
          </div>
        );
    }
  };

  if (steps.length === 0) {
    return (
      <Card className="bg-white rounded-[5px] p-6">
        <h2 className="text-sm font-medium text-black mb-4">
          Cấu hình Dynamic Workflow
        </h2>
        <div className="border-2 border-dashed border-[#c6c8ca] bg-[#f9fafb] rounded-[8px] h-[232px] flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-[#70808f] mb-2">
            Chưa có bước nào
          </p>
          <p className="text-sm text-[#70808f]">
            Chọn action từ bảng bên trái để thêm bước
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-[5px] p-6">
      <h2 className="text-sm font-medium text-black mb-4">
        Cấu hình Dynamic Workflow
      </h2>

      <div className="space-y-2">
        {steps.map((step) => {
          const isExpanded = expandedSteps.has(step.id);

          return (
            <div key={step.id} className="space-y-2">
              {/* Step Header Card */}
              <div className="bg-white border border-gray-200 rounded-lg min-w-0">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 min-w-0"
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, step.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, step.id)}
                >
                  {/* Collapse/Expand Icon */}
                  <div
                    className="text-gray-400 cursor-pointer"
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    {isExpanded ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Step Number */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-sm font-medium text-gray-600 flex-shrink-0">
                    {step.order}
                  </div>

                  {/* Step Icon */}
                  <div>{getStepIcon(step.actionKey)}</div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {step.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary text-white">
                        {step.actionKey}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-2">
                    {/* JSON Preview Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJsonPreview(step.id);
                      }}
                      className="text-xs text-gray-600 px-2 py-1 h-7 hover:text-gray-900 font-bold"
                    >
                      JSON Preview
                    </Button>

                    {/* Drag Handle */}
                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Delete Button - Always reserve space, only show on hover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStep(step.id);
                      }}
                      className={`p-2 h-8 w-8 text-gray-400 hover:text-red-500 transition-all ${
                        hoveredStep === step.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* JSON Preview Section - Show when toggled */}
                {jsonPreviewSteps.has(step.id) && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-2">
                      Preview JSON:
                    </div>
                    <pre className="text-sm text-gray-800 bg-white p-3 rounded border font-mono overflow-auto max-h-40">
                      {JSON.stringify(getConfigDetail(step), null, 2)}
                    </pre>
                  </div>
                )}

                {/* Expanded Config Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {renderStepConfig(step)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
