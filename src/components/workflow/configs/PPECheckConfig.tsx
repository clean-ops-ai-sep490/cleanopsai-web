"use client";

import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { usePPEs } from "@/hooks/usePPEs";
import type { WorkflowStep } from "../WorkflowStepList";

interface PPECheckConfigProps {
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

export function PPECheckConfig({
  step,
  onUpdateStepConfigDetail,
}: PPECheckConfigProps) {
  const { data: ppesData, isLoading } = usePPEs({
    pageSize: 50,
  });

  const configDetail = getConfigDetail(step);
  const selectedPPEs = configDetail.requiredPPE || [];

  const ppeOptions = (ppesData?.content || []).map((ppe) => ({
    value: ppe.actionKey, // Use actionKey instead of id
    label: ppe.name,
    description: `${ppe.actionKey} - ${ppe.description}`,
  }));

  const handlePPEChange = (selectedActionKeys: string[]) => {
    const selectedPPEItems = (ppesData?.content || [])
      .filter((ppe) => selectedActionKeys.includes(ppe.actionKey))
      .map((ppe) => ({
        actionKey: ppe.actionKey,
        name: ppe.name,
      }));

    onUpdateStepConfigDetail(step.id, {
      ...configDetail,
      requiredPPE: selectedPPEItems,
    });
  };

  const currentSelectedActionKeys = Array.isArray(selectedPPEs)
    ? selectedPPEs.map((ppe: any) => ppe.actionKey || ppe)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Thiết bị bảo hộ cá nhân (PPE) yêu cầu
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Chọn các thiết bị bảo hộ cá nhân cần thiết để thực hiện bước này
        </p>
        <div className="mt-2">
          <MultiSelect
            options={ppeOptions}
            value={currentSelectedActionKeys}
            onValueChange={handlePPEChange}
            placeholder={
              isLoading ? "Đang tải PPE..." : "Chọn thiết bị bảo hộ..."
            }
            searchPlaceholder="Tìm kiếm thiết bị bảo hộ..."
            emptyText="Không tìm thấy thiết bị bảo hộ"
            disabled={isLoading}
          />
        </div>
        {selectedPPEs.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">
              Đã chọn {selectedPPEs.length} thiết bị bảo hộ:
            </p>
            <div className="space-y-1">
              {selectedPPEs.map((ppe: any, index: number) => (
                <div
                  key={ppe.actionKey || index}
                  className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1"
                >
                  {ppe.name} ({ppe.actionKey})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
