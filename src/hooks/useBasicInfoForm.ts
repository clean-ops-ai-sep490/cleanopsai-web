import { useEffect, useCallback, useState, useRef } from "react";
import type { SLABasicInfo } from "@/types/sla";
import type { WorkArea, Zone } from "@/types/contract";
import { useBasicInfoData } from "./useBasicInfoData";
import { getZonesPaginated } from "@/lib/zone-api";
import { getWorkAreasPaginated } from "@/lib/work-area-api";
import { getLocationsByClientId } from "@/lib/location-api";

export function useBasicInfoForm(
  data: SLABasicInfo,
  onChange: (data: SLABasicInfo) => void,
) {
  const [locationName, setLocationName] = useState<string>("");
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);

  // Keep refs up to date
  useEffect(() => {
    onChangeRef.current = onChange;
    dataRef.current = data;
  });

  const {
    selectedContract,
    selectedWorkArea,
    selectedEnvironmentType,
    selectedZone,
    selectedLocation,
    loadContracts,
    loadEnvironmentTypes,
    loadSelectedContract,
    loadSelectedWorkArea,
    loadSelectedEnvironmentType,
    loadSelectedZone,
  } = useBasicInfoData();

  const getLocationNameByClientId = useCallback(
    async (clientId: string) => {
      try {
        console.log("Loading location for clientId:", clientId);
        const response = await getLocationsByClientId(clientId, {
          pageNumber: 1,
          pageSize: 1,
        });

        if (response.items && response.items.length > 0) {
          const firstLocation = response.items[0];
          console.log("Found location:", firstLocation.name);
          setLocationName(firstLocation.name);
          onChangeRef.current({
            ...dataRef.current,
            locationId: firstLocation.id || "",
            zoneId: "",
            workAreaId: "",
          });
        } else {
          console.log("No location found for clientId:", clientId);
          setLocationName("");
          onChangeRef.current({
            ...dataRef.current,
            locationId: "",
            zoneId: "",
            workAreaId: "",
          });
        }
      } catch (error) {
        console.error("Failed to get location by clientId:", error);
        setLocationName("");
        onChangeRef.current({
          ...dataRef.current,
          locationId: "",
          zoneId: "",
          workAreaId: "",
        });
      }
    },
    [], // No dependencies - stable function
  );

  // Load selected items when IDs change
  useEffect(() => {
    if (data.contractId && selectedContract?.id !== data.contractId) {
      loadSelectedContract(data.contractId);
    }
  }, [data.contractId, selectedContract?.id, loadSelectedContract]);

  // Trigger location loading when contract is loaded and matches current contractId
  useEffect(() => {
    if (
      data.contractId &&
      selectedContract?.id === data.contractId &&
      selectedContract?.clientId
    ) {
      console.log(
        "Contract loaded and matches, loading location for clientId:",
        selectedContract.clientId,
      );
      getLocationNameByClientId(selectedContract.clientId);
    } else if (!data.contractId) {
      // Clear location when no contract is selected
      setLocationName("");
    }
  }, [
    data.contractId,
    selectedContract?.id,
    selectedContract?.clientId,
    getLocationNameByClientId,
  ]);

  useEffect(() => {
    if (data.workAreaId && selectedWorkArea?.id !== data.workAreaId) {
      loadSelectedWorkArea(data.workAreaId);
    }
  }, [data.workAreaId, selectedWorkArea?.id, loadSelectedWorkArea]);

  useEffect(() => {
    if (
      data.environmentTypeId &&
      selectedEnvironmentType?.id !== data.environmentTypeId
    ) {
      loadSelectedEnvironmentType(data.environmentTypeId);
    }
  }, [
    data.environmentTypeId,
    selectedEnvironmentType?.id,
    loadSelectedEnvironmentType,
  ]);

  useEffect(() => {
    if (data.zoneId && selectedZone?.id !== data.zoneId) {
      loadSelectedZone(data.zoneId);
    }
  }, [data.zoneId, selectedZone?.id, loadSelectedZone]);

  const handleInputChange = (field: keyof SLABasicInfo, value: string) => {
    // Handle hierarchical clearing based on field changes
    if (field === "contractId") {
      // When contract changes, clear all dependent fields immediately
      console.log("Contract changing to:", value);
      setLocationName(""); // Clear location name immediately
      onChange({
        ...data,
        [field]: value,
        locationId: "",
        zoneId: "",
        workAreaId: "",
      });
    } else if (field === "locationId") {
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
      // If no location is selected, return empty list
      if (!data.locationId) {
        return {
          items: [],
          totalCount: 0,
        };
      }

      try {
        const response = await getZonesPaginated({
          pageNumber: 1,
          pageSize: 100,
          search,
          locationId: data.locationId,
        });

        const validZones = (response.items || [])
          .filter((zone): zone is Zone & { id: string } => {
            const hasId =
              zone &&
              (zone.id !== undefined ||
                (zone as any).Id !== undefined ||
                (zone as any).ID !== undefined ||
                (zone as any).zoneId !== undefined);
            return hasId;
          })
          .map((zone) => {
            const normalizedZone = { ...zone };
            if (!normalizedZone.id) {
              normalizedZone.id =
                (zone as any).Id || (zone as any).ID || (zone as any).zoneId;
            }
            return normalizedZone as Zone & { id: string };
          });

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
  );

  // Create a filtered work areas loader based on selected zone
  const loadFilteredWorkAreas = useCallback(
    async (search?: string) => {
      // If no zone is selected, return empty list
      if (!data.zoneId) {
        return {
          items: [],
          totalCount: 0,
        };
      }

      try {
        const response = await getWorkAreasPaginated({
          pageNumber: 1,
          pageSize: 1000,
          search,
          zoneId: data.zoneId,
        });

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
  );

  return {
    selectedContract,
    selectedWorkArea,
    selectedEnvironmentType,
    selectedZone,
    selectedLocation,
    locationName,
    loadContracts,
    loadWorkAreas: loadFilteredWorkAreas,
    loadEnvironmentTypes,
    loadZones: loadFilteredZones,
    handleInputChange,
    formatWorkAreaDisplay,
  };
}
