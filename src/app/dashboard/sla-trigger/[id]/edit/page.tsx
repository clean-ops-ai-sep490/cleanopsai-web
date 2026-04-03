"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import type { SLATrigger, CreateSLATriggerData } from "@/types/sla";

// Mock data - in real app this would come from API
const mockTrigger: SLATrigger = {
  id: "1",
  name: "Response Time Alert",
  type: "Response Time",
  condition: "Greater than",
  threshold: 30,
  unit: "minutes",
  status: "active",
  createdAt: "2024-01-15",
};

export default function EditSLATriggerPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<CreateSLATriggerData>({
    name: "",
    type: "",
    condition: "",
    threshold: 0,
    unit: "",
  });

  const [errors, setErrors] = useState<Partial<CreateSLATriggerData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading trigger data
    setTimeout(() => {
      setFormData({
        name: mockTrigger.name,
        type: mockTrigger.type,
        condition: mockTrigger.condition,
        threshold: mockTrigger.threshold,
        unit: mockTrigger.unit,
      });
      setIsLoading(false);
    }, 500);
  }, []);

  const triggerTypes = [
    {
      value: "Response Time",
      label: "Response Time",
      description: "Time to first response to cleaning request",
    },
    {
      value: "Resolution Time",
      label: "Resolution Time",
      description: "Time to complete cleaning task",
    },
    {
      value: "Quality Score",
      label: "Quality Score",
      description: "AI-based cleaning quality assessment",
    },
    {
      value: "Completion Rate",
      label: "Completion Rate",
      description: "Percentage of tasks completed on time",
    },
    {
      value: "Equipment Downtime",
      label: "Equipment Downtime",
      description: "Equipment unavailability duration",
    },
    {
      value: "Staff Utilization",
      label: "Staff Utilization",
      description: "Staff efficiency and availability",
    },
  ];

  const conditions = [
    { value: "Greater than", label: "Greater than (>)" },
    { value: "Less than", label: "Less than (<)" },
    { value: "Equal to", label: "Equal to (=)" },
    { value: "Greater than or equal", label: "Greater than or equal (≥)" },
    { value: "Less than or equal", label: "Less than or equal (≤)" },
  ];

  const units = [
    { value: "seconds", label: "Seconds" },
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "percentage", label: "Percentage (%)" },
    { value: "count", label: "Count" },
  ];

  const validateForm = () => {
    const newErrors: Partial<CreateSLATriggerData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Trigger name is required";
    }
    if (!formData.type) {
      newErrors.type = "Trigger type is required";
    }
    if (!formData.condition) {
      newErrors.condition = "Condition is required";
    }
    if (formData.threshold <= 0) {
      newErrors.threshold = "Threshold must be greater than 0";
    }
    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically save to backend
      console.log("Updating SLA Trigger:", formData);

      // Simulate API call
      setTimeout(() => {
        router.push(`/dashboard/sla-trigger/${params.id}`);
      }, 1000);
    }
  };

  const selectedTriggerType = triggerTypes.find(
    (t) => t.value === formData.type,
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/sla-trigger/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trigger Details
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Edit SLA Trigger
            </h1>
            <p className="text-gray-600 mt-1">
              Update monitoring configuration for cleaning operations
              performance
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-[#1a80a2]" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Trigger Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Response Time Alert"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Trigger Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.type}
                    </p>
                  )}
                  {selectedTriggerType && (
                    <p className="text-sm text-gray-600">
                      {selectedTriggerType.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trigger Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Trigger Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.condition ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem
                          key={condition.value}
                          value={condition.value}
                        >
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.condition}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold Value *</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={formData.threshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        threshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={errors.threshold ? "border-red-500" : ""}
                  />
                  {errors.threshold && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.threshold}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.unit ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {formData.type &&
                formData.condition &&
                formData.threshold > 0 &&
                formData.unit && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Updated Trigger Preview:
                    </h4>
                    <p className="text-blue-800">
                      Alert when <strong>{formData.type}</strong> is{" "}
                      <strong>{formData.condition.toLowerCase()}</strong>{" "}
                      <strong>
                        {formData.threshold} {formData.unit}
                      </strong>
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link href={`/dashboard/sla-trigger/${params.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
