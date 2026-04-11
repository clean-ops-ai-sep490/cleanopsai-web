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
import { createLocation } from "@/lib/location-api";
import { useEntityForm } from "@/hooks/useEntityForm";
import { validators } from "@/lib/validators/form-validators";
import type { LocationFormData, Client } from "@/types/contract";

interface LocationFormProps {
  clients: Client[];
  clientsLoading: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultClientId?: string;
}

export function LocationForm({
  clients,
  clientsLoading,
  onSuccess,
  onCancel,
  defaultClientId,
}: LocationFormProps) {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleNumberChange,
    handleSelectChange,
    handleReset,
    handleSubmit,
  } = useEntityForm<LocationFormData>({
    initialData: {
      name: "",
      address: "",
      street: "",
      commune: "",
      province: "",
      latitude: 0,
      longitude: 0,
      clientId: defaultClientId || "",
    },
    mutationFn: createLocation,
    queryKey: ["locations"],
    onSuccess,
    successMessage: "Location created successfully",
    errorMessage: "Failed to create location",
    validationRules: {
      name: [validators.required("Tên location")],
      address: [validators.required("Địa chỉ")],
      clientId: [validators.required("Client")],
      latitude: [validators.numeric("Latitude")],
      longitude: [validators.numeric("Longitude")],
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
            placeholder="Enter location name"
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address}</p>
          )}
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
              onChange={handleNumberChange("latitude")}
              placeholder="0.0"
            />
            {errors.latitude && (
              <p className="text-sm text-red-600">{errors.latitude}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleNumberChange("longitude")}
              placeholder="0.0"
            />
            {errors.longitude && (
              <p className="text-sm text-red-600">{errors.longitude}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId">Client *</Label>
          <Select
            value={formData.clientId}
            onValueChange={handleSelectChange("clientId")}
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
          {errors.clientId && (
            <p className="text-sm text-red-600">{errors.clientId}</p>
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
