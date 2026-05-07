"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getLocationsPaginatedNew, getLocationById } from "@/lib/location-api";
import { getZonesPaginatedNew, getZoneById } from "@/lib/zone-api";
import { getWorkAreasPaginatedNew, getWorkAreaById } from "@/lib/work-area-api";
import { getWorkAreaDetailsPaginated, getWorkAreaDetailById } from "@/lib/work-area-detail-api";
import { getSLAById } from "@/lib/sla-api";
import { getContractById } from "@/lib/contract-api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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
  const selectedLocationId = formData.locationId;
  const selectedZoneId = formData.zoneId;
  const selectedWorkAreaId = formData.workAreaId;
  const selectedWorkAreaDetailId = formData.workAreaDetailId;
  const slaId = formData.slaId;

  // Fetch SLA details to get contractId
  const { data: slaData } = useQuery({
    queryKey: ["sla", slaId],
    queryFn: () => getSLAById(slaId),
    enabled: !!slaId,
  });
  const slaObject = Array.isArray(slaData) ? slaData[0] : slaData;

  // Fetch contract details to get clientId
  const { data: contractData } = useQuery({
    queryKey: ["contract", slaObject?.contractId],
    queryFn: () => getContractById(slaObject?.contractId),
    enabled: !!slaObject?.contractId,
  });
  
  // Get selected objects for display name and address logic
  const { data: selectedLocation } = useQuery({
    queryKey: ["location", selectedLocationId],
    queryFn: () => getLocationById(selectedLocationId),
    enabled: !!selectedLocationId,
  });

  const { data: selectedZone } = useQuery({
    queryKey: ["zone", selectedZoneId],
    queryFn: () => getZoneById(selectedZoneId),
    enabled: !!selectedZoneId,
  });

  const { data: selectedWorkArea } = useQuery({
    queryKey: ["work-area", selectedWorkAreaId],
    queryFn: () => getWorkAreaById(selectedWorkAreaId),
    enabled: !!selectedWorkAreaId,
  });

  const { data: selectedWorkAreaDetail } = useQuery({
    queryKey: ["work-area-detail", selectedWorkAreaDetailId],
    queryFn: () => getWorkAreaDetailById(selectedWorkAreaDetailId),
    enabled: !!selectedWorkAreaDetailId,
  });


  // Sync location address to form for AssignmentSection
  useEffect(() => {
    if (selectedLocation) {
      updateField("locationAddress", selectedLocation.address);
    }
  }, [selectedLocation]);

  // Sync work area detail info to form
  useEffect(() => {
    if (selectedWorkAreaDetail) {
      updateField("workAreaDetailName", selectedWorkAreaDetail.name);
      
      // If we're in edit mode (have workAreaDetailId but missing parent IDs), back-fill them
      if (!selectedWorkAreaId && selectedWorkAreaDetail.workAreaId) {
        updateField("workAreaId", selectedWorkAreaDetail.workAreaId);
      }
    }
  }, [selectedWorkAreaDetail, selectedWorkAreaId]);

  // Back-fill zoneId from workArea
  useEffect(() => {
    if (selectedWorkArea && !selectedZoneId && selectedWorkArea.zoneId) {
      updateField("zoneId", selectedWorkArea.zoneId);
    }
  }, [selectedWorkArea, selectedZoneId]);

  // Back-fill locationId from zone
  useEffect(() => {
    if (selectedZone && !selectedLocationId && selectedZone.locationId) {
      updateField("locationId", selectedZone.locationId);
    }
  }, [selectedZone, selectedLocationId]);

  // Auto-generate displayLocation when all selections are made
  useEffect(() => {
    if (
      selectedLocation &&
      selectedZone &&
      selectedWorkArea &&
      formData.workAreaDetailName
    ) {
      // Ưu tiên thông tin chi tiết lên trước để dễ nhận diện trong danh sách
      const displayLocation = [
        formData.workAreaDetailName, // Tên phòng/vị trí cụ thể (ví dụ: Phòng 101)
        selectedWorkArea.name,       // Khu vực (ví dụ: Sảnh)
        selectedZone.name,           // Zone (ví dụ: Tòa nhà A)
        selectedLocation.address || selectedLocation.name || "" // Địa chỉ tổng quát
      ].filter(Boolean).join(", ");
      
      updateField("displayLocation", displayLocation);
    }
  }, [
    selectedLocation,
    selectedZone,
    selectedWorkArea,
    formData.workAreaDetailName,
  ]);

  const handleLocationChange = (value: string) => {
    updateField("locationId", value);
    updateField("zoneId", "");
    updateField("workAreaId", "");
    updateField("workAreaDetailId", "");
  };

  const handleZoneChange = (value: string) => {
    updateField("zoneId", value);
    updateField("workAreaId", "");
    updateField("workAreaDetailId", "");
  };

  const handleWorkAreaChange = (value: string) => {
    updateField("workAreaId", value);
    updateField("workAreaDetailId", "");
  };

  return (
    <div className="space-y-6">
      <div>
        {/* <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình khu vực
        </h2> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Selection */}
          <div className="space-y-2">
            <Label>Địa điểm *</Label>
            <SearchableSelect
              value={selectedLocationId || ""}
              onValueChange={handleLocationChange}
              placeholder={!slaId ? "Chọn SLA trước" : "Chọn địa điểm"}
              disabled={!contractData?.clientId}
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["locations", "infinite", contractData?.clientId || ""]}
              queryFn={(page, pageSize, search) => 
                getLocationsPaginatedNew(page, pageSize, { search, clientId: contractData?.clientId }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                }))
              }
              getItemById={(id) => 
                getLocationById(id).then(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }
              displayFormatter={(item: any) => item.address}
            />
            {errors.locationId && (
              <p className="text-sm text-red-500">{errors.locationId}</p>
            )}
          </div>

          {/* Zone Selection */}
          <div className="space-y-2">
            <Label>Zone *</Label>
            <SearchableSelect
              value={selectedZoneId || ""}
              onValueChange={handleZoneChange}
              placeholder={!selectedLocationId ? "Chọn địa điểm trước" : "Chọn zone"}
              disabled={!selectedLocationId}
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["zones", "infinite", selectedLocationId || ""]}
              queryFn={(page, pageSize, search) => 
                getZonesPaginatedNew(page, pageSize, { search, locationId: selectedLocationId }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                }))
              }
              getItemById={(id) => 
                getZoneById(id).then(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }
            />
            {errors.zoneId && (
              <p className="text-sm text-red-500">{errors.zoneId}</p>
            )}
          </div>

          {/* Work Area Selection */}
          <div className="space-y-2">
            <Label>Khu vực làm việc *</Label>
            <SearchableSelect
              value={selectedWorkAreaId || ""}
              onValueChange={handleWorkAreaChange}
              placeholder={!selectedZoneId ? "Chọn zone trước" : "Chọn khu vực"}
              disabled={!selectedZoneId}
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["work-areas", "infinite", selectedZoneId || ""]}
              queryFn={(page, pageSize, search) => 
                getWorkAreasPaginatedNew(page, pageSize, { search, zoneId: selectedZoneId }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                }))
              }
              getItemById={(id) => 
                getWorkAreaById(id).then(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }
            />
            {errors.workAreaId && (
              <p className="text-sm text-red-500">{errors.workAreaId}</p>
            )}
          </div>

          {/* WorkAreaDetail Selection */}
          <div className="space-y-2">
            <Label htmlFor="workAreaDetailId">Chi tiết khu vực *</Label>
            <SearchableSelect
              value={selectedWorkAreaDetailId || ""}
              onValueChange={(val) => updateField("workAreaDetailId", val)}
              placeholder={!selectedWorkAreaId ? "Chọn khu vực làm việc trước" : "Chọn chi tiết khu vực"}
              disabled={!selectedWorkAreaId}
              useInfiniteLoading={true}
              pageSize={10}
              queryKey={["work-area-details", "infinite", selectedWorkAreaId || ""]}
              queryFn={(page, pageSize, search) => 
                getWorkAreaDetailsPaginated(page, pageSize, { search, workAreaId: selectedWorkAreaId }).then(res => ({
                  ...res,
                  content: res.content.map(item => ({
                    ...item,
                    id: item.id || "",
                    name: item.name || ""
                  }))
                }))
              }
              getItemById={(id) => 
                getWorkAreaDetailById(id).then(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }
              displayFormatter={(item: any) => item.name}
            />
            {errors.workAreaDetailId && (
              <p className="text-sm text-red-500">{errors.workAreaDetailId}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
