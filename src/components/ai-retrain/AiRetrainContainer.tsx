"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole, useRole } from "@/hooks/useRole";
import { BarChart3, CheckCircle2, GitBranch, Play } from "lucide-react";
import { DataWorkflow } from "./AiRetrainDataQueue";
import {
  BenchmarkDatasetOverview,
  BenchmarkOverview,
  ModelVersions,
} from "./AiRetrainQuality";
import { RetrainRuns } from "./AiRetrainTraining";

type RetrainTab = "data" | "training" | "quality";

function parseRetrainTab(value?: string | null): RetrainTab {
  if (value === "training" || value === "runs") {
    return "training";
  }

  if (value === "quality" || value === "benchmark" || value === "models") {
    return "quality";
  }

  return "data";
}

const workflowSteps: Array<{
  value: RetrainTab;
  title: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    value: "data",
    title: "Dữ liệu",
    description: "Duyệt ảnh và chuẩn bị nhãn chuẩn",
    icon: CheckCircle2,
  },
  {
    value: "training",
    title: "Huấn luyện",
    description: "Kích hoạt và theo dõi phiên chạy",
    icon: GitBranch,
  },
  {
    value: "quality",
    title: "Đánh giá",
    description: "Kiểm tra chất lượng trước khi sử dụng",
    icon: BarChart3,
  },
];

function workflowTabClass(isActive: boolean) {
  return [
    "flex h-full items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
    isActive
      ? "border-[#1a80a2] bg-[#eaf6fa] text-[#0f6680] shadow-sm"
      : "border-gray-200 bg-white text-gray-600 hover:border-[#a8d8e7] hover:bg-gray-50 hover:text-gray-900",
  ].join(" ");
}

export function AiRetrainContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasRole } = useRole();
  const canTriggerTraining = hasRole([
    UserRole.Supervisor,
    UserRole.Manager,
    UserRole.Admin,
  ]);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const activeTab = parseRetrainTab(searchParams.get("tab"));

  const handleTabChange = (value: string) => {
    const nextTab = parseRetrainTab(value);
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === "data") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-xl font-semibold text-black">
            Huấn luyện mô hình AI
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Duyệt dữ liệu chuẩn, huấn luyện và đánh giá mô hình trước khi đưa
            vào sử dụng.
          </p>
        </div>
        {canTriggerTraining && (
          <Button
            className="w-full cursor-pointer bg-[#1a80a2] hover:bg-[#1a80a2]/90 sm:w-auto"
            onClick={() => {
              handleTabChange("training");
              setTrainingDialogOpen(true);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Kích hoạt huấn luyện mô hình
          </Button>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-3"
      >
        <div className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
          <TabsList
            className="grid h-auto w-full grid-cols-1 gap-1.5 bg-transparent p-0 md:grid-cols-3"
          >
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeTab === step.value;

              return (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  className="h-auto min-w-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 text-current after:hidden data-active:bg-transparent data-active:shadow-none focus-visible:ring-0"
                >
                  <span className={workflowTabClass(isActive)}>
                    <span
                      className={[
                        "flex h-8 w-8 flex-none items-center justify-center rounded-md",
                        isActive
                          ? "bg-[#1a80a2] text-white"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {step.title}
                      </span>
                      <span className="hidden whitespace-normal text-xs leading-4 text-gray-500 xl:block">
                        {step.description}
                      </span>
                    </span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <TabsContent value="data">
          <DataWorkflow />
        </TabsContent>
        <TabsContent value="training">
          <RetrainRuns
            dialogOpen={trainingDialogOpen}
            onDialogOpenChange={setTrainingDialogOpen}
          />
        </TabsContent>
        <TabsContent value="quality" className="space-y-5">
          <BenchmarkDatasetOverview />
          <BenchmarkOverview />
          <ModelVersions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
