"use client";

import { Label } from "@/components/ui/label";
import type { WorkflowStep } from "../WorkflowStepList";

interface CheckInConfigProps {
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

export function CheckInConfig({
  step,
  onUpdateStepConfigDetail,
}: CheckInConfigProps) {
  const configDetail = getConfigDetail(step);
  const selectedMethod = configDetail?.method || "";

  const selectMethod = (method: "qr") => {
    // Tạo configDetail mới, loại bỏ methods cũ và chỉ giữ method mới
    const newConfigDetail = { ...configDetail };

    // Xóa methods cũ nếu tồn tại
    delete newConfigDetail.methods;

    // Set method mới
    newConfigDetail.method = method;

    onUpdateStepConfigDetail(step.id, newConfigDetail);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-3 mt-3">
          <div
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === "qr"
                ? "border-primary bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => selectMethod("qr")}
          >
            <div>
              <div className="font-medium text-sm">QR Code</div>
              <div className="text-sm text-gray-500">
                Quét mã QR để check-in
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "qr"
                  ? "border-primary bg-primary"
                  : "border-gray-300"
              }`}
            >
              {selectedMethod === "qr" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
