"use client";

import { Card } from "@/components/ui/card";
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
import { createWorkArea } from "@/lib/work-area-api";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";
import type { WorkAreaFormData, Zone } from "@/types/contract";

interface WorkAreaFormProps {
  zones: Zone[];
  zonesLoading: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultZoneId?: string;
}

export function WorkAreaForm({
  zones,
  zonesLoading,
  onSuccess,
  onCancel,
  defaultZoneId,
}: WorkAreaFormProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleReset,
    handleSubmit,
  } = useEntityForm<WorkAreaFormData>({
    initialData: {
      name: "",
      zoneId: defaultZoneId || "",
    },
    mutationFn: createWorkArea,
    queryKey: ["workAreas"],
    onSuccess,
    successMessage: "Work area created successfully",
    errorMessage: "Failed to create work area",
    validationRules: {
      name: [validators.required("Tên work area")],
      zoneId: [validators.required("Zone")],
    },
    validateOnChange: true,
  });

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange("name")}
            placeholder="Enter work area name"
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoneId">Zone *</Label>
          <Select
            value={formData.zoneId}
            onValueChange={handleSelectChange("zoneId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a zone" />
            </SelectTrigger>
            <SelectContent>
              {zonesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading zones...
                </SelectItem>
              ) : (
                zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id!}>
                    {zone.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.zoneId && (
            <p className="text-sm text-red-600">{errors.zoneId}</p>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Execute"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
