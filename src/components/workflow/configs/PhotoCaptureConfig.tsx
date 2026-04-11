"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkflowStep } from "../WorkflowStepList";

interface PhotoCaptureConfigProps {
  step: WorkflowStep;
  onUpdateStepConfigDetail: (id: string, configDetail: any) => void;
  allSteps?: WorkflowStep[];
}

// Helper function to ensure configDetail is always an object
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

export function PhotoCaptureConfig({
  step,
  onUpdateStepConfigDetail,
  allSteps = [],
}: PhotoCaptureConfigProps) {
  const configDetail = getConfigDetail(step);
  const currentPhase = configDetail.phase || "before";

  // Kiểm tra phase nào đã được sử dụng bởi các photo-capture step khác
  const usedPhases = allSteps
    .filter(
      (s) => s.actionKey.toLowerCase() === "photo-capture" && s.id !== step.id,
    )
    .map((s) => {
      const config = getConfigDetail(s);
      return config.phase || "before";
    });

  const isPhaseDisabled = (phase: string) => usedPhases.includes(phase);

  // Use local state for input to allow free typing
  const [inputValue, setInputValue] = React.useState(
    (configDetail.minPhotos || 5).toString(),
  );

  // State for validation error message
  const [validationError, setValidationError] = React.useState<string>("");

  // Update local state when step config changes externally
  React.useEffect(() => {
    setInputValue((configDetail.minPhotos || 5).toString());
    setValidationError(""); // Clear error when config changes
  }, [configDetail.minPhotos]);

  const handlePhaseChange = (newPhase: string) => {
    onUpdateStepConfigDetail(step.id, {
      ...configDetail,
      phase: newPhase,
    });
  };

  const handleMinPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Clear previous error
    setValidationError("");

    // Prevent typing more than 1 digit or values above 5
    if (value.length > 1) {
      setValidationError("Chỉ được nhập 1 chữ số");
      return; // Don't allow more than 1 digit
    }

    // Check if value is valid (empty or 1-5)
    if (value === "") {
      setInputValue(value);
      return;
    }

    // Check if it's a valid digit 1-5
    if (/^[1-5]$/.test(value)) {
      setInputValue(value); // Update local state
      const numValue = parseInt(value);
      onUpdateStepConfigDetail(step.id, {
        ...configDetail,
        minPhotos: numValue,
      });
    } else {
      setValidationError("Chỉ được nhập số từ 1 đến 5");
    }
  };

  const handleMinPhotosBlur = () => {
    // On blur, if empty, set to default value of 5
    if (inputValue === "" || inputValue === "0") {
      setInputValue("5");
      onUpdateStepConfigDetail(step.id, {
        ...configDetail,
        minPhotos: 5,
      });
    }
    // Clear validation error on blur
    setValidationError("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Giai đoạn chụp ảnh
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Chọn thời điểm chụp ảnh trong quy trình
          </p>
          <Select value={currentPhase} onValueChange={handlePhaseChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Chọn giai đoạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="before"
                disabled={isPhaseDisabled("before")}
                className={
                  isPhaseDisabled("before")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                Trước khi thực hiện (Before)
                {isPhaseDisabled("before") && " - Đã được sử dụng"}
              </SelectItem>
              <SelectItem
                value="after"
                disabled={isPhaseDisabled("after")}
                className={
                  isPhaseDisabled("after")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                Sau khi thực hiện (After)
                {isPhaseDisabled("after") && " - Đã được sử dụng"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900">
            Số ảnh tối thiểu
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Số lượng ảnh worker cần chụp
          </p>
          <Input
            type="number"
            min="1"
            max="5"
            maxLength={1}
            pattern="[1-5]"
            value={inputValue}
            onChange={handleMinPhotosChange}
            onBlur={handleMinPhotosBlur}
            className={`mt-2 ${validationError ? "border-red-500 border-2 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="Nhập số ảnh (1-5)..."
          />
          {validationError && (
            <p className="text-red-500 text-sm mt-1 font-medium">
              {validationError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
