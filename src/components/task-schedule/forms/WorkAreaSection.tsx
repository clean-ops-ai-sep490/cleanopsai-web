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
import { useWorkAreas } from "@/hooks/useWorkAreas";
import { useWorkAreaDetailsByWorkArea } from "@/hooks/useWorkAreaDetails";
import { useZonesByLocation } from "@/hooks/useZones";
import { useSLA } from "@/hooks/useSLAQuery";
import { useContract } from "@/hooks/useContracts";
import { useLocationsByClient } from "@/hooks/useLocations";
import { useState, useEffect } from "react";

interface WorkAreaSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
}

export function WorkAreaSection({
  formData,
  errors,
  updateField,
}: WorkAreaSectionProps) {
  // Use formData instead of local state where possible
  const selectedLocationId = formData.locationId;
  const selectedZoneId = formData.zoneId;
  const selectedWorkAreaId = formData.workAreaId;
  const slaId = formData.slaId;

  // Fetch SLA details to get contractId
  const { data: slaData } = useSLA(slaId, {
    enabled: !!slaId,
  });

  // Get the actual SLA object from array
  const slaObject =
    Array.isArray(slaData) && slaData.length > 0 ? slaData[0] : slaData;

  // Fetch contract details to get clientId
  const {
    data: contractData,
  } = useContract(slaObject?.contractId);
  
  // Fetch locations by clientId
  const {
    data: locationsData,
    isLoading: locationsLoading,
  } = useLocationsByClient(contractData?.clientId);
  const locations = locationsData?.items || [];

  // Fetch zones based on selected location
  const { data: zonesData, isLoading: zonesLoading } =
    useZonesByLocation(selectedLocationId);
  const zones = zonesData?.items || [];

  // Fetch work areas based on selected zone
  const { data: workAreasData, isLoading: workAreasLoading } = useWorkAreas(
    selectedZoneId ? { zoneId: selectedZoneId } : undefined,
  );
  const workAreas = workAreasData?.items || [];

  // Fetch work area details based on selected work area
  const { data: workAreaDetailsData } =
    useWorkAreaDetailsByWorkArea(selectedWorkAreaId);
  const workAreaDetails = workAreaDetailsData?.items || [];

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (slaId) {
      updateField("locationId", "");
      updateField("zoneId", "");
      updateField("workAreaId", "");
      updateField("workAreaDetailId", "");
      updateField("displayLocation", "");
    }
  }, [slaId]);

  // Auto-generate displayLocation when all selections are made
  useEffect(() => {
    const selectedLocation = locations.find(
      (loc) => loc.id === selectedLocationId,
    );
    const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
    const selectedWorkArea = workAreas.find(
      (area) => area.id === selectedWorkAreaId,
    );
    // Note: We're currently creating a NEW work area detail in the form, 
    // but the original code had some logic for existing details too.
    // Let's stick to the creation logic as per the form fields below.

    if (
      selectedLocation &&
      selectedZone &&
      selectedWorkArea &&
      formData.workAreaDetailName
    ) {
      const displayLocation = `${selectedLocation.address}, ${selectedZone.name}, ${selectedWorkArea.name}, ${formData.workAreaDetailName}`;
      updateField("displayLocation", displayLocation);
    }
  }, [
    selectedLocationId,
    selectedZoneId,
    selectedWorkAreaId,
    formData.workAreaDetailName,
    locations,
    zones,
    workAreas,
  ]);

  const handleLocationChange = (value: string) => {
    updateField("locationId", value);

    // Lưu address vào form để AssignmentSection sử dụng
    const selectedLocation = locations.find((loc) => loc.id === value);
    if (selectedLocation) {
      updateField("locationAddress", selectedLocation.address);
    }

    // Reset dependent selections
    updateField("zoneId", "");
    updateField("workAreaId", "");
    updateField("workAreaDetailId", "");
  };

  const handleZoneChange = (value: string) => {
    updateField("zoneId", value);
    // Reset dependent selections
    updateField("workAreaId", "");
    updateField("workAreaDetailId", "");
  };

  const handleWorkAreaChange = (value: string) => {
    updateField("workAreaId", value);
    // Reset work area detail when work area changes
    updateField("workAreaDetailId", "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình khu vực
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Selection */}
          <div className="space-y-2">
            <Label>Địa điểm *</Label>
            <Select
              value={selectedLocationId || ""}
              onValueChange={handleLocationChange}
              disabled={!contractData?.clientId || locationsLoading}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !slaId
                      ? "Chọn SLA trước"
                      : !contractData?.clientId
                        ? "Đang tải thông tin khách hàng..."
                        : locationsLoading
                          ? "Đang tải địa điểm..."
                          : locations.length === 0
                            ? "Không có địa điểm nào"
                            : "Chọn địa điểm"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location: any) => (
                  <SelectItem key={location.id} value={location.id!}>
                    {location.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.locationId && (
              <p className="text-sm text-red-500">{errors.locationId}</p>
            )}
          </div>

          {/* Zone Selection */}
          <div className="space-y-2">
            <Label>Zone *</Label>
            <Select
              value={selectedZoneId || ""}
              onValueChange={handleZoneChange}
              disabled={!selectedLocationId || zonesLoading}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !selectedLocationId
                      ? "Chọn địa điểm trước"
                      : zonesLoading
                        ? "Đang tải..."
                        : zones.length === 0
                          ? "Không có zone nào"
                          : "Chọn zone"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone: any) => (
                  <SelectItem key={zone.id} value={zone.id!}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.zoneId && (
              <p className="text-sm text-red-500">{errors.zoneId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Khu vực làm việc *</Label>
            <Select
              value={selectedWorkAreaId || ""}
              onValueChange={handleWorkAreaChange}
              disabled={!selectedZoneId}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !selectedZoneId
                      ? "Chọn zone trước"
                      : workAreasLoading
                        ? "Đang tải..."
                        : "Chọn khu vực"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {workAreas.map((area: any) => (
                  <SelectItem key={area.id} value={area.id!}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workAreaId && (
              <p className="text-sm text-red-500">{errors.workAreaId}</p>
            )}
          </div>
        </div>

        {/* WorkAreaDetail Creation Fields */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workAreaDetailName">Tên chi tiết khu vực</Label>
              <Input
                id="workAreaDetailName"
                value={formData.workAreaDetailName || ""}
                onChange={(e) => updateField("workAreaDetailName", e.target.value)}
                placeholder="Nhập tên chi tiết khu vực"
                className="bg-white border-[#e5e5e5]"
              />
              {errors.workAreaDetailName && (
                <p className="text-sm text-red-500">{errors.workAreaDetailName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workAreaDetailArea">Diện tích (m²)</Label>
              <Input
                id="workAreaDetailArea"
                type="number"
                step="0.01"
                value={formData.workAreaDetailArea || ""}
                onChange={(e) => updateField("workAreaDetailArea", Number(e.target.value))}
                placeholder="Nhập diện tích"
                className="bg-white border-[#e5e5e5]"
              />
              {errors.workAreaDetailArea && (
                <p className="text-sm text-red-500">{errors.workAreaDetailArea}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
