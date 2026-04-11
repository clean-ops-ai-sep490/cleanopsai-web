"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions } from "@/components/ui/form-actions";
import type { CreateSLATriggerData } from "@/types/sla";

interface SLATriggerFormContentProps {
  formData: CreateSLATriggerData;
  errors: Record<string, string>;
  isLoading: boolean;
  mode: "create" | "edit";
  onInputChange: (
    field: keyof CreateSLATriggerData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (
    field: keyof CreateSLATriggerData,
  ) => (value: string) => void;
  onNumberChange: (
    field: keyof CreateSLATriggerData,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onCancel: () => void;
}

export function SLATriggerFormContent({
  formData,
  errors,
  isLoading,
  mode,
  onInputChange,
  onSelectChange,
  onNumberChange,
  onSubmit,
  onReset,
  onCancel,
}: SLATriggerFormContentProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Trigger Name *</Label>
        <Input
          id="name"
          placeholder="Enter trigger name"
          value={formData.name}
          onChange={onInputChange("name")}
          required
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Trigger Type *</Label>
        <Select value={formData.type} onValueChange={onSelectChange("type")}>
          <SelectTrigger>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Response Time">Response Time</SelectItem>
            <SelectItem value="Resolution Time">Resolution Time</SelectItem>
            <SelectItem value="Quality Score">Quality Score</SelectItem>
            <SelectItem value="Customer Satisfaction">
              Customer Satisfaction
            </SelectItem>
            <SelectItem value="First Contact Resolution">
              First Contact Resolution
            </SelectItem>
            <SelectItem value="Escalation Rate">Escalation Rate</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="condition">Condition *</Label>
          <Select
            value={formData.condition}
            onValueChange={onSelectChange("condition")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Greater than">Greater than</SelectItem>
              <SelectItem value="Less than">Less than</SelectItem>
              <SelectItem value="Equal to">Equal to</SelectItem>
              <SelectItem value="Greater than or equal">
                Greater than or equal
              </SelectItem>
              <SelectItem value="Less than or equal">
                Less than or equal
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-sm text-red-600">{errors.condition}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="threshold">Threshold *</Label>
          <Input
            id="threshold"
            type="number"
            placeholder="0"
            value={formData.threshold}
            onChange={onNumberChange("threshold")}
            required
          />
          {errors.threshold && (
            <p className="text-sm text-red-600">{errors.threshold}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit *</Label>
        <Select value={formData.unit} onValueChange={onSelectChange("unit")}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="count">Count</SelectItem>
          </SelectContent>
        </Select>
        {errors.unit && <p className="text-sm text-red-600">{errors.unit}</p>}
      </div>

      <FormActions
        onReset={onReset}
        onCancel={onCancel}
        submitLabel={mode === "create" ? "Create Trigger" : "Save Changes"}
        isLoading={isLoading}
        showReset={true}
        showCancel={true}
      />
    </form>
  );
}
