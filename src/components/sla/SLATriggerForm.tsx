"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StandardDialog } from "@/components/ui/standard-dialog";
import { FormActions } from "@/components/ui/form-actions";
import type { SLATrigger, CreateSLATriggerData } from "@/types/sla";

interface SLATriggerFormProps {
  trigger?: SLATrigger;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: SLATrigger) => void;
  mode: "create" | "edit";
}

export function SLATriggerForm({
  trigger,
  isOpen,
  onClose,
  onSave,
  mode,
}: SLATriggerFormProps) {
  const [formData, setFormData] = useState<CreateSLATriggerData>({
    name: "",
    type: "",
    condition: "",
    threshold: 0,
    unit: "",
  });

  useEffect(() => {
    if (trigger) {
      setFormData({
        name: trigger.name,
        type: trigger.type,
        condition: trigger.condition,
        threshold: trigger.threshold,
        unit: trigger.unit,
      });
    } else {
      setFormData({
        name: "",
        type: "",
        condition: "",
        threshold: 0,
        unit: "",
      });
    }
  }, [trigger]);

  const handleSave = () => {
    if (mode === "create") {
      const newTrigger: SLATrigger = {
        ...formData,
        id: Date.now().toString(),
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      onSave(newTrigger);
    } else if (trigger) {
      const updatedTrigger: SLATrigger = {
        ...trigger,
        ...formData,
      };
      onSave(updatedTrigger);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      type: "",
      condition: "",
      threshold: 0,
      unit: "",
    });
  };

  const isFormValid =
    formData.name && formData.type && formData.condition && formData.unit;

  return (
    <StandardDialog
      open={isOpen}
      onOpenChange={onClose}
      title={mode === "create" ? "Create New SLA Trigger" : "Edit SLA Trigger"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Trigger Name *</Label>
          <Input
            id="name"
            placeholder="Enter trigger name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Trigger Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) =>
                setFormData({ ...formData, condition: value })
              }
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold *</Label>
            <Input
              id="threshold"
              type="number"
              placeholder="0"
              value={formData.threshold}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  threshold: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
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
        </div>

        <FormActions
          onReset={handleReset}
          onCancel={onClose}
          submitLabel={mode === "create" ? "Create Trigger" : "Save Changes"}
          isLoading={false}
          showReset={true}
          showCancel={true}
        />
      </form>
    </StandardDialog>
  );
}
