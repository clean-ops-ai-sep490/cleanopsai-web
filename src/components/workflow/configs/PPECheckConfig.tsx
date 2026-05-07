"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { getPPEs } from "@/lib/ppe-api";
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
  const configDetail = getConfigDetail(step);
  const selectedPPEs = configDetail.requiredPPE || [];

  // Store PPE data to map actionKeys to names
  const ppeDataRef = useRef<Map<string, string>>(new Map());

  const handlePPEChange = (selectedActionKeys: string[]) => {
    // Use stored PPE data to get names
    const selectedPPEItems = selectedActionKeys.map((actionKey) => ({
      actionKey,
      name: ppeDataRef.current.get(actionKey) || actionKey, // Use stored name or fallback to actionKey
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
            value={currentSelectedActionKeys}
            onValueChange={handlePPEChange}
            placeholder="Chọn thiết bị bảo hộ..."
            searchPlaceholder="Tìm kiếm thiết bị bảo hộ..."
            emptyText="Không tìm thấy thiết bị bảo hộ"
            queryKey={["ppes", "workflow"]}
            queryFn={async (page, pageSize, searchQuery) => {
              const response = await getPPEs({
                pageNumber: page,
                pageSize,
                search: searchQuery,
              });

              // Store PPE data for later use
              response.content.forEach((ppe) => {
                ppeDataRef.current.set(ppe.actionKey, ppe.name);
              });

              return {
                content: response.content.map((ppe) => ({
                  value: ppe.actionKey,
                  label: ppe.name,
                  description: `${ppe.actionKey} - ${ppe.description}`,
                  imageUrl: ppe.imageUrl ? ppe.imageUrl.split("?")[0] : undefined,
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
