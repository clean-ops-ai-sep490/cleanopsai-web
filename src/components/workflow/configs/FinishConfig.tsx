"use client";

import { Label } from "@/components/ui/label";
import type { WorkflowStep } from "../WorkflowStepList";

interface FinishConfigProps {
  step: WorkflowStep;
  onUpdateStepConfigDetail: (id: string, configDetail: any) => void;
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

export function FinishConfig({
  step,
  onUpdateStepConfigDetail,
}: FinishConfigProps) {
  const configDetail = getConfigDetail(step);
  const requireNote = configDetail?.requireNote || false;

  const toggleRequireNote = () => {
    onUpdateStepConfigDetail(step.id, {
      ...configDetail,
      requireNote: !requireNote,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Cấu hình hoàn thành công việc
        </Label>
        <div className="mt-3">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">
                Bắt buộc ghi chú
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Worker phải nhập ghi chú khi hoàn thành công việc
              </div>
            </div>
            <div className="ml-4">
              <button
                type="button"
                onClick={toggleRequireNote}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  requireNote ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    requireNote ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
