import React, { useState, useCallback, useMemo, useRef } from "react";
import { useContracts } from "./useContracts";
import { useClients } from "./useClients";
import { useLocations, useLocationsByClient } from "./useLocations";
import { useZones, useZonesByLocation } from "./useZones";
import { useWorkAreas, useWorkAreasByZone } from "./useWorkAreas";
import { useEnvironmentTypes } from "./useEnvironmentTypes";
import type { SLABasicInfo } from "@/types/sla";

/**
 * SLA Form Data Hook - Manages hierarchical data for SLA forms
 * Replaces the complex useBasicInfoData with cleaner, modular approach
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

  // Base data hooks
  const contractsQuery = useContracts();
  const clientsQuery = useClients();
  const environmentTypesQuery = useEnvironmentTypes();

  // Hierarchical data hooks based on selections
  const selectedContract = useMemo(
    () => contractsQuery.data?.items?.find((c) => c.id === data.contractId),
    [contractsQuery.data?.items, data.contractId],
  );

  const clientId = selectedContract?.clientId;

  const locationsQuery = useLocationsByClient(clientId);
  const selectedLocation = useMemo(
    () => locationsQuery.data?.items?.[0],
    [locationsQuery.data?.items],
  );

  const zonesQuery = useZonesByLocation(selectedLocation?.id);
  const selectedZone = useMemo(
    () => zonesQuery.data?.items?.find((z) => z.id === data.zoneId),
    [zonesQuery.data?.items, data.zoneId],
  );

  const workAreasQuery = useWorkAreasByZone(data.zoneId);
  const selectedWorkArea = useMemo(
    () => workAreasQuery.data?.items?.find((w) => w.id === data.workAreaId),
    [workAreasQuery.data?.items, data.workAreaId],
  );

  const selectedEnvironmentType = useMemo(
    () =>
      environmentTypesQuery.data?.items?.find(
        (e) => e.id === data.environmentTypeId,
      ),
    [environmentTypesQuery.data?.items, data.environmentTypeId],
  );

  // Auto-update location when contract changes
  const handleContractChange = useCallback(
    (contractId: string) => {
      const currentData = dataRef.current;
      const contract = contractsQuery.data?.items?.find(
        (c) => c.id === contractId,
      );
      if (contract?.clientId) {
        // Location will be auto-loaded by useLocationsByClient hook
        onChangeRef.current({
          ...currentData,
          contractId,
          locationId: "", // Will be set when location loads
          zoneId: "",
          workAreaId: "",
        });
      } else {
        onChangeRef.current({
          ...currentData,
          contractId,
          locationId: "",
          zoneId: "",
          workAreaId: "",
        });
      }
      setLocationName("");
    },
    [contractsQuery.data?.items],
  );

  // Auto-update location name when location data loads
  const selectedLocationId = selectedLocation?.id;
  const selectedLocationName = selectedLocation?.name;

  React.useEffect(() => {
    const currentData = dataRef.current;
    if (selectedLocationId && selectedLocationId !== currentData.locationId) {
      setLocationName(selectedLocationName || "");
      onChangeRef.current({
        ...currentData,
        locationId: selectedLocationId,
        zoneId: "", // Clear dependent fields
        workAreaId: "",
      });
    }
  }, [selectedLocationId, selectedLocationName]);

  const handleInputChange = useCallback(
    (field: keyof SLABasicInfo, value: string) => {
      const currentData = dataRef.current;
      if (field === "contractId") {
        handleContractChange(value);
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
    [handleContractChange],
  );

  return {
    // Data
    contracts: contractsQuery.data?.items || [],
    clients: clientsQuery.data?.items || [],
    locations: locationsQuery.data?.items || [],
    zones: zonesQuery.data?.items || [],
    workAreas: workAreasQuery.data?.items || [],
    environmentTypes: environmentTypesQuery.data?.items || [],

    // Selected items
    selectedContract,
    selectedLocation,
    selectedZone,
    selectedWorkArea,
    selectedEnvironmentType,
    locationName,

    // Loading states
    isLoading:
      contractsQuery.isLoading ||
      clientsQuery.isLoading ||
      locationsQuery.isLoading ||
      zonesQuery.isLoading ||
      workAreasQuery.isLoading ||
      environmentTypesQuery.isLoading,

    contractsLoading: contractsQuery.isLoading,
    locationsLoading: locationsQuery.isLoading,
    zonesLoading: zonesQuery.isLoading,
    workAreasLoading: workAreasQuery.isLoading,
    environmentTypesLoading: environmentTypesQuery.isLoading,

    // Actions
    handleInputChange,

    // Utility functions
    formatWorkAreaDisplay: (workArea: any) => workArea.name,
  };
}
