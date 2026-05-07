"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { WorkflowStep } from "../WorkflowStepList";

interface ListItemsConfigProps {
  step: WorkflowStep;
  onUpdateStepConfigDetail: (id: string, configDetail: any) => void;
  title: string;
  description?: string;
  itemPlaceholder: string;
  addButtonText: string;
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

export function ListItemsConfig({
  step,
  onUpdateStepConfigDetail,
  title,
  description,
  itemPlaceholder,
  addButtonText,
}: ListItemsConfigProps) {
  const configDetail = getConfigDetail(step);

  const addItem = () => {
    const newItems = [...(configDetail?.items || []), ""];
    onUpdateStepConfigDetail(step.id, { ...configDetail, items: newItems });
  };

  const updateItem = (itemIndex: number, value: string) => {
    const newItems = [...(configDetail?.items || [])];
    newItems[itemIndex] = value;
    onUpdateStepConfigDetail(step.id, { ...configDetail, items: newItems });
  };

  const removeItem = (itemIndex: number) => {
    const newItems = (configDetail?.items || []).filter(
      (_: any, i: number) => i !== itemIndex,
    );
    onUpdateStepConfigDetail(step.id, { ...configDetail, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">{title}</Label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
        <div className="space-y-2 mt-2">
          {(configDetail?.items || []).map((item: string, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={itemPlaceholder}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="p-2 h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={addItem}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
