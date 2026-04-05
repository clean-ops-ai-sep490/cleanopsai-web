"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { createWorkArea } from "@/lib/work-area-api";
import { getZones } from "@/lib/zone-api";
import type { WorkAreaFormData, Zone } from "@/types/contract";

interface WorkAreaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultZoneId?: string;
}

export function WorkAreaForm({
  onSuccess,
  onCancel,
  defaultZoneId,
}: WorkAreaFormProps) {
  const [formData, setFormData] = useState<WorkAreaFormData>({
    name: "",
    zoneId: defaultZoneId || "",
  });

  const queryClient = useQueryClient();

  // Fetch zones
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });

  // Create work area mutation
  const createWorkAreaMutation = useMutation({
    mutationFn: createWorkArea,
    onSuccess: () => {
      toast.success("Work area created successfully");
      queryClient.invalidateQueries({ queryKey: ["workAreas"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create work area");
      console.error("Work area creation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.zoneId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createWorkAreaMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof WorkAreaFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleReset = () => {
    setFormData({
      name: "",
      zoneId: defaultZoneId || "",
    });
  };

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
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoneId">Zone *</Label>
          <Select
            value={formData.zoneId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, zoneId: value }))
            }
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
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createWorkAreaMutation.isPending}
            className="flex-1"
          >
            {createWorkAreaMutation.isPending ? "Creating..." : "Execute"}
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
