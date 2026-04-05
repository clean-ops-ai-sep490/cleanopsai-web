import { useEffect, useCallback } from "react";
import type { SLABasicInfo } from "@/types/sla";
import type { WorkArea, Zone } from "@/types/contract";
import { useBasicInfoData } from "./useBasicInfoData";
import { getZonesPaginated } from "@/lib/zone-api";
import { getWorkAreasPaginated } from "@/lib/work-area-api";

export function useBasicInfoForm(
  data: SLABasicInfo,
  onChange: (data: SLABasicInfo) => void,
) {
  const {
    selectedContract,
    selectedWorkArea,
    selectedEnvironmentType,
    selectedZone,
    selectedLocation,
    loadContracts,
    loadWorkAreas,
    loadEnvironmentTypes,
    loadZones,
    loadLocations,
    loadSelectedContract,
    loadSelectedWorkArea,
    loadSelectedEnvironmentType,
    loadSelectedZone,
    loadSelectedLocation,
  } = useBasicInfoData();

  // Load selected items when IDs change
  useEffect(() => {
    if (data.contractId) {
      loadSelectedContract(data.contractId);
    }
  }, [data.contractId]);

  useEffect(() => {
    if (data.workAreaId) {
      loadSelectedWorkArea(data.workAreaId);
    }
  }, [data.workAreaId]);

  useEffect(() => {
    if (data.environmentTypeId) {
      loadSelectedEnvironmentType(data.environmentTypeId);
    }
  }, [data.environmentTypeId]);

  useEffect(() => {
    if (data.locationId) {
      loadSelectedLocation(data.locationId);
    }
  }, [data.locationId]);

  useEffect(() => {
    if (data.zoneId) {
      loadSelectedZone(data.zoneId);
    }
  }, [data.zoneId]);

  const handleInputChange = (field: keyof SLABasicInfo, value: string) => {
    // Handle hierarchical clearing based on field changes
    if (field === "locationId") {
      onChange({ ...data, [field]: value, zoneId: "", workAreaId: "" });
    } else if (field === "zoneId") {
      onChange({ ...data, [field]: value, workAreaId: "" });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  const formatWorkAreaDisplay = (workArea: WorkArea) => {
    if (workArea.zoneName) {
      return `${workArea.name}`;
    }
    return workArea.name;
  };

  // Create filtered loaders based on hierarchical selection
  const loadFilteredZones = useCallback(
    async (search?: string) => {
      console.log("loadFilteredZones called with locationId:", data.locationId);

      // If no location is selected, return empty list
      if (!data.locationId) {
        console.log("No locationId, returning empty zones");
        return {
          items: [],
          totalCount: 0,
        };
      }

      try {
        console.log(
          "Calling getZonesPaginated with locationId:",
          data.locationId,
        );
        const response = await getZonesPaginated({
          pageNumber: 1,
          pageSize: 100,
          search,
          locationId: data.locationId,
        });

        console.log("Filtered zones response:", response);

        const validZones = (response.items || [])
          .filter((zone): zone is Zone & { id: string } => {
            // Check for different possible id field names
            const hasId =
              zone &&
              (zone.id !== undefined ||
                (zone as any).Id !== undefined ||
                (zone as any).ID !== undefined ||
                (zone as any).zoneId !== undefined);

            console.log("Zone item:", zone, "hasId:", hasId);
            return hasId;
          })
          .map((zone) => {
            // Normalize the id field
            const normalizedZone = { ...zone };
            if (!normalizedZone.id) {
              normalizedZone.id =
                (zone as any).Id || (zone as any).ID || (zone as any).zoneId;
            }
            return normalizedZone as Zone & { id: string };
          });

        console.log("Valid zones after filter:", validZones);

        return {
          items: validZones,
          totalCount: response.totalCount || 0,
        };
      } catch (error) {
        console.error("Failed to load filtered zones:", error);
        return {
          items: [],
          totalCount: 0,
        };
      }
    },
    [data.locationId],
  ); // Re-create when locationId changes

  // Create a filtered work areas loader based on selected zone
  const loadFilteredWorkAreas = useCallback(
    async (search?: string) => {
      console.log("loadFilteredWorkAreas called with zoneId:", data.zoneId);

      // If no zone is selected, return empty list
      if (!data.zoneId) {
        console.log("No zoneId, returning empty work areas");
        return {
          items: [],
          totalCount: 0,
        };
      }

      try {
        console.log("Calling getWorkAreasPaginated with zoneId:", data.zoneId);
        // Use the zone-specific endpoint
        const response = await getWorkAreasPaginated({
          pageNumber: 1,
          pageSize: 1000,
          search,
          zoneId: data.zoneId,
        });

        console.log("Filtered work areas response:", response);

        const validWorkAreas = (response.items || []).filter(
          (workArea): workArea is WorkArea & { id: string } =>
            workArea && workArea.id !== undefined,
        );

        return {
          items: validWorkAreas,
          totalCount: response.totalCount || 0,
        };
      } catch (error) {
        console.error("Failed to load filtered work areas:", error);
        return {
          items: [],
          totalCount: 0,
        };
      }
    },
    [data.zoneId],
  ); // Re-create when zoneId changes

  return {
    selectedContract,
    selectedWorkArea,
    selectedEnvironmentType,
    selectedZone,
    selectedLocation,
    loadContracts,
    loadWorkAreas: loadFilteredWorkAreas,
    loadEnvironmentTypes,
    loadZones: loadFilteredZones,
    loadLocations,
    handleInputChange,
    formatWorkAreaDisplay,
  };
}
