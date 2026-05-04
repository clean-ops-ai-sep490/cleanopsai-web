"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import type { Step } from "@/types/sop";
import type { WorkflowStep } from "./WorkflowStepList";

interface ActionRegistryProps {
  steps: Step[];
  isLoading: boolean;
  onAddStep: (step: Step) => void;
  workflowSteps?: WorkflowStep[]; // Thêm prop để kiểm tra step đã được sử dụng
}

export function ActionRegistry({
  steps,
  isLoading,
  onAddStep,
  workflowSteps = [],
}: ActionRegistryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // Kiểm tra step đã được sử dụng
  const isStepUsed = (step: Step) => {
    if (step.actionKey.toLowerCase() === "photo-capture") {
      const photoSteps = workflowSteps.filter(
        (s) => s.actionKey.toLowerCase() === "photo-capture",
      );
      return photoSteps.length >= 2;
    }
    return workflowSteps.some(
      (s) => s.actionKey.toLowerCase() === step.actionKey.toLowerCase(),
    );
  };

  const getStepStatus = (step: Step) => {
    if (step.actionKey.toLowerCase() === "photo-capture") {
      const photoSteps = workflowSteps.filter(
        (s) => s.actionKey.toLowerCase() === "photo-capture",
      );
      if (photoSteps.length === 0) return "available";
      if (photoSteps.length === 1) return "partial";
      return "used";
    }
    return isStepUsed(step) ? "used" : "available";
  };

  // Filter steps based on search term
  const filteredSteps = steps.filter(
    (step) =>
      step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.actionKey.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <aside className="w-[228px] flex-shrink-0">
      <Card className="bg-[#f9fafb] rounded-[5px] p-4 sticky top-[122px] flex flex-col max-h-[calc(100vh-140px)]">
        <h2 className="text-[15px] font-medium text-black mb-4 flex-shrink-0">
          Danh sách hành động
        </h2>

        {/* Search Input */}
        <div className="relative mb-4 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8 text-sm bg-white border-gray-200"
          />
        </div>

        {/* Scrollable Actions List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="ml-2 text-xs text-[#70808f]">Đang tải...</span>
            </div>
          ) : filteredSteps.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-[#70808f]">
                {searchTerm
                  ? "Không tìm thấy action phù hợp"
                  : "Không có steps nào"}
              </p>
            </div>
          ) : (
            filteredSteps.map((action) => {
              const status = getStepStatus(action);
              const isDisabled = status === "used";

              return (
                <div
                  key={action.id}
                  className={`border border-gray-100 rounded-[10px] p-3 transition-colors ${
                    isDisabled
                      ? "bg-gray-100 cursor-not-allowed opacity-60"
                      : "bg-[#f9fafb] cursor-pointer hover:bg-white"
                  }`}
                  onClick={() => !isDisabled && onAddStep(action)}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-medium ${isDisabled ? "text-gray-500" : "text-black"}`}
                    >
                      {action.name}
                    </p>
                    {status === "used" && (
                      <span className="text-xs bg-gray-200 text-red-600 px-2 py-1 rounded">
                        Đã dùng
                      </span>
                    )}
                    {status === "partial" && (
                      <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded">
                        1/2
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[13px] ${isDisabled ? "text-gray-400" : "text-[#70808f]"}`}
                  >
                    {action.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </aside>
  );
}
