"use client";

import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useEquipments } from "@/hooks/useEquipments";
import type { WorkflowStep } from "../WorkflowStepList";

interface EquipmentCheckConfigProps {
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

export function EquipmentCheckConfig({
  step,
  onUpdateStepConfigDetail,
}: EquipmentCheckConfigProps) {
  const { data: equipmentsData, isLoading } = useEquipments({
    pageSize: 100,
  });

  const configDetail = getConfigDetail(step);
  const selectedEquipmentIds = configDetail.requiredEquipment || [];

  const equipmentOptions = (equipmentsData?.content || []).map((equipment) => ({
    value: equipment.id,
    label: equipment.name,
    description: `${equipment.type} - ${equipment.description}`,
  }));

  const handleEquipmentChange = (selectedIds: string[]) => {
    const selectedEquipments = (equipmentsData?.content || [])
      .filter((equipment) => selectedIds.includes(equipment.id))
      .map((equipment) => ({
        id: equipment.id,
        name: equipment.name,
      }));

    onUpdateStepConfigDetail(step.id, {
      ...configDetail,
      requiredEquipment: selectedEquipments,
    });
  };

  const currentSelectedIds = Array.isArray(selectedEquipmentIds)
    ? selectedEquipmentIds.map((eq: any) => eq.id || eq)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Thiết bị yêu cầu
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Chọn các thiết bị cần thiết để thực hiện bước này
        </p>
        <div className="mt-2">
          <MultiSelect
            options={equipmentOptions}
            value={currentSelectedIds}
            onValueChange={handleEquipmentChange}
            placeholder={
              isLoading ? "Đang tải thiết bị..." : "Chọn thiết bị..."
            }
            searchPlaceholder="Tìm kiếm thiết bị..."
            emptyText="Không tìm thấy thiết bị"
            disabled={isLoading}
          />
        </div>
        {selectedEquipmentIds.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">
              Đã chọn {selectedEquipmentIds.length} thiết bị:
            </p>
            <div className="space-y-1">
              {selectedEquipmentIds.map((equipment: any, index: number) => (
                <div
                  key={equipment.id || index}
                  className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1"
                >
                  {equipment.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
