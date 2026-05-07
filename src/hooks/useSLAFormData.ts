import React, { useState, useCallback, useMemo, useRef } from "react";
import { useContract } from "./useContracts";
import { useLocation } from "./useLocations";
import { useZone } from "./useZones";
import { useWorkArea } from "./useWorkAreas";
import { useEnvironmentType } from "./useEnvironmentTypes";
import type { SLABasicInfo } from "@/types/sla";

/**
 * SLA Form Data Hook - Manages hierarchical data for SLA forms
 * Optimized to prevent over-fetching of large lists
 */
export function useSLAFormData(
  data: SLABasicInfo,
  onChange: (data: SLABasicInfo) => void,
) {
  const [locationName, setLocationName] = useState<string>("");
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);

  // Keep refs updated
  React.useEffect(() => {
    onChangeRef.current = onChange;
    dataRef.current = data;
  }, [onChange, data]);

  // Hierarchical data hooks based on ID selections
  const contractQuery = useContract(data.contractId);
  const selectedContract = contractQuery.data;

  const clientId = selectedContract?.clientId;

  const locationQuery = useLocation(data.locationId);
  const selectedLocation = locationQuery.data;

  const zoneQuery = useZone(data.zoneId);
  const selectedZone = zoneQuery.data;

  const workAreaQuery = useWorkArea(data.workAreaId);
  const selectedWorkArea = workAreaQuery.data;

  const environmentTypeQuery = useEnvironmentType(data.environmentTypeId);
  const selectedEnvironmentType = environmentTypeQuery.data;

  // Auto-update location name when location data loads
  React.useEffect(() => {
    if (selectedLocation) {
      setLocationName(selectedLocation.name || selectedLocation.address || "");
    } else {
      setLocationName("");
    }
  }, [selectedLocation]);

  const handleInputChange = useCallback(
    (field: keyof SLABasicInfo, value: string) => {
      const currentData = dataRef.current;
      
      if (field === "contractId") {
        // Reset ALL dependent fields when contract changes
        onChangeRef.current({
          ...currentData,
          contractId: value,
          locationId: "", 
          zoneId: "",
          workAreaId: "",
        });
        setLocationName("");
      } else if (field === "locationId") {
        onChangeRef.current({
          ...currentData,
          [field]: value,
          zoneId: "",
          workAreaId: "",
        });
      } else if (field === "zoneId") {
        onChangeRef.current({ ...currentData, [field]: value, workAreaId: "" });
      } else {
        onChangeRef.current({ ...currentData, [field]: value });
      }
    },
    [],
  );

  return {
    // Selected items
    selectedContract,
    selectedLocation,
    selectedZone,
    selectedWorkArea,
    selectedEnvironmentType,
    locationName,
    clientId,

    // Loading states
    isLoading:
      contractQuery.isLoading ||
      locationQuery.isLoading ||
      zoneQuery.isLoading ||
      workAreaQuery.isLoading ||
      environmentTypeQuery.isLoading,

    // Actions
    handleInputChange,

    // Utility functions
    formatWorkAreaDisplay: (workArea: any) => workArea?.name || "",
  };
}
