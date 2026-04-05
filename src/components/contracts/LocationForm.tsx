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
import { createLocation } from "@/lib/location-api";
import { getClients } from "@/lib/client-api";
import type { LocationFormData, Client } from "@/types/contract";

interface LocationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultClientId?: string;
}

export function LocationForm({
  onSuccess,
  onCancel,
  defaultClientId,
}: LocationFormProps) {
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    address: "",
    street: "",
    commune: "",
    province: "",
    latitude: 0,
    longitude: 0,
    clientId: defaultClientId || "",
  });

  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      toast.success("Location created successfully");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create location");
      console.error("Location creation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.clientId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createLocationMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof LocationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "latitude" || field === "longitude"
          ? parseFloat(e.target.value) || 0
          : e.target.value;

      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleReset = () => {
    setFormData({
      name: "",
      address: "",
      street: "",
      commune: "",
      province: "",
      latitude: 0,
      longitude: 0,
      clientId: defaultClientId || "",
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
            placeholder="Enter location name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={handleInputChange("address")}
            placeholder="Enter address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              type="text"
              value={formData.street}
              onChange={handleInputChange("street")}
              placeholder="Enter street"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commune">Commune</Label>
            <Input
              id="commune"
              type="text"
              value={formData.commune}
              onChange={handleInputChange("commune")}
              placeholder="Enter commune"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Province</Label>
          <Input
            id="province"
            type="text"
            value={formData.province}
            onChange={handleInputChange("province")}
            placeholder="Enter province"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleInputChange("latitude")}
              placeholder="0.0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleInputChange("longitude")}
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Client *</Label>
          <Select
            value={formData.clientId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, clientId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clientsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading clients...
                </SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id!}>
                    {client.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createLocationMutation.isPending}
            className="flex-1"
          >
            {createLocationMutation.isPending ? "Creating..." : "Execute"}
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
