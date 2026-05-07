"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { getEquipments } from "@/lib/equipment-api";
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
  const configDetail = getConfigDetail(step);
  const selectedEquipmentIds = configDetail.requiredEquipment || [];

  // Store equipment data to map IDs to names
  const equipmentDataRef = useRef<Map<string, string>>(new Map());

  const handleEquipmentChange = (selectedIds: string[]) => {
    // Use stored equipment data to get names
    const selectedEquipments = selectedIds.map((id) => ({
      id,
      name: equipmentDataRef.current.get(id) || id, // Use stored name or fallback to id
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
            value={currentSelectedIds}
            onValueChange={handleEquipmentChange}
            placeholder="Chọn thiết bị..."
            searchPlaceholder="Tìm kiếm thiết bị..."
            emptyText="Không tìm thấy thiết bị"
            queryKey={["equipments", "workflow"]}
            queryFn={async (page, pageSize, searchQuery) => {
              const response = await getEquipments({
                pageNumber: page,
                pageSize,
                search: searchQuery,
              });

              // Store equipment data for later use
              response.content.forEach((equipment) => {
                equipmentDataRef.current.set(equipment.id, equipment.name);
              });

              return {
                content: response.content.map((equipment: any) => ({
                  value: equipment.id,
                  label: equipment.name,
                  description: `${equipment.type} - ${equipment.description}`,
                  imageUrl: equipment.imageUrl ? equipment.imageUrl.split("?")[0] : undefined,
                })),
                pageNumber: page,
                pageSize,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage,
              };
            }}
            useInfiniteLoading={true}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
