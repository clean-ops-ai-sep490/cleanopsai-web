"use client";

import {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
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
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

export function WorkAreaSection({
  register,
  setValue,
  watch,
  errors,
}: WorkAreaSectionProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedWorkAreaId, setSelectedWorkAreaId] = useState<string>("");

  // Watch form values to get SLA selection
  const slaId = watch("slaId");

  // Fetch SLA details to get contractId
  const { data: slaData, isLoading: slaLoading } = useSLA(slaId, {
    enabled: !!slaId,
  });

  // Get the actual SLA object from array
  const slaObject =
    Array.isArray(slaData) && slaData.length > 0 ? slaData[0] : slaData;

  // Fetch contract details to get clientId
  const {
    data: contractData,
    isLoading: contractLoading,
    error: contractError,
  } = useContract(slaObject?.contractId);
  // Fetch locations by clientId
  const {
    data: locationsData,
    isLoading: locationsLoading,
    error: locationsError,
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
  const { data: workAreaDetailsData, isLoading: workAreaDetailsLoading } =
    useWorkAreaDetailsByWorkArea(selectedWorkAreaId);
  const workAreaDetails = workAreaDetailsData?.items || [];

  // Reset dependent selections when parent changes
  useEffect(() => {
    if (slaId) {
      // Reset all selections when SLA changes
      setSelectedLocationId("");
      setSelectedZoneId("");
      setSelectedWorkAreaId("");
      setValue("locationId", "");
      setValue("zoneId", "");
      setValue("workAreaId", "");
      setValue("workAreaDetailId", "");
      setValue("displayLocation", "");
    }
  }, [slaId, setValue]);

  // Auto-generate displayLocation when all selections are made
  useEffect(() => {
    const selectedLocation = locations.find(
      (loc) => loc.id === selectedLocationId,
    );
    const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
    const selectedWorkArea = workAreas.find(
      (area) => area.id === selectedWorkAreaId,
    );
    const selectedWorkAreaDetail = workAreaDetails.find(
      (detail) => detail.id === watch("workAreaDetailId"),
    );

    if (
      selectedLocation &&
      selectedZone &&
      selectedWorkArea &&
      selectedWorkAreaDetail
    ) {
      const displayLocation = `${selectedLocation.address}, ${selectedZone.name}, ${selectedWorkArea.name}, ${selectedWorkAreaDetail.name}`;
      setValue("displayLocation", displayLocation);
    } else {
      setValue("displayLocation", "");
    }
  }, [
    selectedLocationId,
    selectedZoneId,
    selectedWorkAreaId,
    watch("workAreaDetailId"),
    locations,
    zones,
    workAreas,
    workAreaDetails,
    setValue,
    watch,
  ]);

  const handleLocationChange = (value: string) => {
    setSelectedLocationId(value);
    setValue("locationId", value);

    // Lưu address vào form để AssignmentSection sử dụng
    const selectedLocation = locations.find((loc) => loc.id === value);
    if (selectedLocation) {
      setValue("locationAddress", selectedLocation.address);
    }

    // Reset dependent selections
    setSelectedZoneId("");
    setSelectedWorkAreaId("");
    setValue("zoneId", "");
    setValue("workAreaId", "");
    setValue("workAreaDetailId", "");
  };

  const handleZoneChange = (value: string) => {
    setSelectedZoneId(value);
    setValue("zoneId", value);
    // Reset dependent selections
    setSelectedWorkAreaId("");
    setValue("workAreaId", "");
    setValue("workAreaDetailId", "");
  };

  const handleWorkAreaChange = (value: string) => {
    setSelectedWorkAreaId(value);
    setValue("workAreaId", value);
    // Reset work area detail when work area changes
    setValue("workAreaDetailId", "");
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
              <p className="text-sm text-red-500">
                {(errors.locationId as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          {/* Zone Selection */}
          <div className="space-y-2">
            <Label>Zone *</Label>
            <Select
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
              <p className="text-sm text-red-500">
                {(errors.zoneId as any)?.message || "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Khu vực làm việc *</Label>
            <Select
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
              <p className="text-sm text-red-500">
                {(errors.workAreaId as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Chi tiết khu vực *</Label>
            <Select
              onValueChange={(value) => setValue("workAreaDetailId", value)}
              disabled={!selectedWorkAreaId}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue
                  placeholder={
                    !selectedWorkAreaId
                      ? "Chọn khu vực trước"
                      : workAreaDetailsLoading
                        ? "Đang tải..."
                        : "Chọn chi tiết khu vực"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {workAreaDetails.map((detail: any) => (
                  <SelectItem key={detail.id} value={detail.id!}>
                    {detail.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.workAreaDetailId && (
              <p className="text-sm text-red-500">
                {(errors.workAreaDetailId as any)?.message ||
                  "Trường này là bắt buộc"}
              </p>
            )}
          </div>
        </div>

        {/* Hidden field for auto-generated displayLocation */}
        <input type="hidden" {...register("displayLocation")} />

        {/* WorkAreaDetail Creation Fields */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workAreaDetailName">Tên chi tiết khu vực</Label>
              <Input
                id="workAreaDetailName"
                {...register("workAreaDetailName")}
                placeholder="Nhập tên chi tiết khu vực"
                className="bg-white border-[#e5e5e5]"
              />
              {errors.workAreaDetailName && (
                <p className="text-sm text-red-500">
                  {(errors.workAreaDetailName as any)?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workAreaDetailArea">Diện tích (m²)</Label>
              <Input
                id="workAreaDetailArea"
                type="number"
                step="0.01"
                {...register("workAreaDetailArea", { valueAsNumber: true })}
                placeholder="Nhập diện tích"
                className="bg-white border-[#e5e5e5]"
              />
              {errors.workAreaDetailArea && (
                <p className="text-sm text-red-500">
                  {(errors.workAreaDetailArea as any)?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
