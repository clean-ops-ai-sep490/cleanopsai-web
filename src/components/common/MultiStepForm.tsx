"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StepDefinition {
  id: string;
  label: string;
  title: string;
  description: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: StepDefinition[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
}

export function MultiStepForm({
  steps,
  activeStep,
  onStepChange,
}: MultiStepFormProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs
          value={activeStep}
          onValueChange={onStepChange}
          className="w-full"
        >
          <TabsList className={`grid w-full grid-cols-${steps.length}`}>
            {steps.map((step, index) => (
              <TabsTrigger key={step.id} value={step.id}>
                {index + 1}. {step.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            {steps.map((step) => (
              <TabsContent key={step.id} value={step.id} className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-lg font-medium">{step.title}</h2>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {step.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export type { StepDefinition };
