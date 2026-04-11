import { useState, useEffect, useCallback } from "react";
import type { Contract, WorkArea, Zone, Location } from "@/types/contract";
import { getContractsPaginated, getContractById } from "@/lib/contract-api";
import {
  getWorkAreasPaginated,
  type WorkAreasPaginatedRequest,
} from "@/lib/work-area-api";
import { getZonesPaginated } from "@/lib/zone-api";
import { getLocationsPaginated, getLocations } from "@/lib/location-api";
import { getEnvironmentTypesPaginated } from "@/lib/environment-type-api";
import type { EnvironmentType } from "@/types/sop";

export function useBasicInfoData() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [selectedWorkArea, setSelectedWorkArea] = useState<WorkArea | null>(
    null,
  );
  const [selectedEnvironmentType, setSelectedEnvironmentType] =
    useState<EnvironmentType | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const loadContracts = useCallback(async (search?: string) => {
    try {
      const response = await getContractsPaginated({
        pageNumber: 1,
        pageSize: 100,
        search,
      });

      const validContracts = (response.items || []).filter(
        (contract): contract is Contract & { id: string } =>
          contract && contract.id !== undefined,
      );

      return {
        items: validContracts,
        totalCount: response.totalCount || 0,
      };
    } catch (error) {
      console.error("Failed to load contracts:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, []);

  const loadWorkAreas = useCallback(async (search?: string) => {
    try {
      const response = await getWorkAreasPaginated({
        pageNumber: 1,
        pageSize: 1000,
        search,
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
      console.error("Failed to load work areas:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, []);

  const loadLocations = useCallback(async (search?: string) => {
    try {
      // Try paginated API first
      const response = await getLocationsPaginated({
        pageNumber: 1,
        pageSize: 100,
        search,
      });

      console.log("Locations response in hook:", response);

      if (response.items && response.items.length > 0) {
        const validLocations = (response.items || [])
          .filter((location): location is Location & { id: string } => {
            // Check for different possible id field names
            const hasId =
              location &&
              (location.id !== undefined ||
                (location as any).Id !== undefined ||
                (location as any).ID !== undefined ||
                (location as any).locationId !== undefined);

            console.log("Location item:", location, "hasId:", hasId);
            return hasId;
          })
          .map((location) => {
            // Normalize the id field
            const normalizedLocation = { ...location };
            if (!normalizedLocation.id) {
              normalizedLocation.id =
                (location as any).Id ||
                (location as any).ID ||
                (location as any).locationId;
            }
            return normalizedLocation as Location & { id: string };
          });

        console.log("Valid locations after filter:", validLocations);

        return {
          items: validLocations,
          totalCount: response.totalCount || 0,
        };
      }

      // Fallback to old API if paginated returns empty
      console.log("Paginated API returned empty, trying fallback API");
      const fallbackResponse = await getLocations();
      console.log("Fallback locations response:", fallbackResponse);

      const validFallbackLocations = (fallbackResponse || [])
        .filter((location): location is Location & { id: string } => {
          const hasId =
            location &&
            (location.id !== undefined ||
              (location as any).Id !== undefined ||
              (location as any).ID !== undefined ||
              (location as any).locationId !== undefined);
          return hasId;
        })
        .map((location) => {
          const normalizedLocation = { ...location };
          if (!normalizedLocation.id) {
            normalizedLocation.id =
              (location as any).Id ||
              (location as any).ID ||
              (location as any).locationId;
          }
          return normalizedLocation as Location & { id: string };
        });

      return {
        items: validFallbackLocations,
        totalCount: validFallbackLocations.length,
      };
    } catch (error) {
      console.error("Failed to load locations:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, []);

  const loadZones = useCallback(async (search?: string) => {
    try {
      const response = await getZonesPaginated({
        pageNumber: 1,
        pageSize: 100,
        search,
      });

      console.log("Zones response in hook:", response);

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
      console.error("Failed to load zones:", error);
      return {
        items: [],
        totalCount: 0,
      };
    }
  }, []);

  const loadEnvironmentTypes = useCallback(async (search?: string) => {
    try {
      return await getEnvironmentTypesPaginated({
        pageNumber: 1,
        pageSize: 50,
        search,
      });
    } catch (error) {
      console.error("Failed to load environment types:", error);
      return {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 50,
      };
    }
  }, []);

  const loadSelectedContract = useCallback(async (contractId: string) => {
    try {
      console.log("loadSelectedContract called with:", contractId);
      const contract = await getContractById(contractId);
      console.log("Found contract:", contract);
      setSelectedContract(contract || null);
    } catch (error) {
      console.error("Failed to load selected contract:", error);
      setSelectedContract(null);
    }
  }, []);

  const loadSelectedWorkArea = useCallback(
    async (workAreaId: string) => {
      try {
        const response = await loadWorkAreas();
        const workArea = response.items.find((w) => w.id === workAreaId);
        setSelectedWorkArea(workArea || null);
      } catch (error) {
        console.error("Failed to load selected work area:", error);
        setSelectedWorkArea(null);
      }
    },
    [loadWorkAreas],
  );

  const loadSelectedEnvironmentType = useCallback(
    async (environmentTypeId: string) => {
      try {
        const response = await loadEnvironmentTypes();
        const envType = response.items.find((e) => e.id === environmentTypeId);
        setSelectedEnvironmentType(envType || null);
      } catch (error) {
        console.error("Failed to load selected environment type:", error);
        setSelectedEnvironmentType(null);
      }
    },
    [loadEnvironmentTypes],
  );

  const loadSelectedLocation = useCallback(
    async (locationId: string) => {
      try {
        console.log("loadSelectedLocation called with:", locationId);
        const response = await loadLocations();
        console.log("loadSelectedLocation response:", response);
        const location = response.items.find((l) => l.id === locationId);
        console.log("Found location:", location);
        setSelectedLocation(location || null);
      } catch (error) {
        console.error("Failed to load selected location:", error);
        setSelectedLocation(null);
      }
    },
    [loadLocations],
  );

  const loadSelectedZone = useCallback(
    async (zoneId: string) => {
      try {
        const response = await loadZones();
        const zone = response.items.find((z) => z.id === zoneId);
        setSelectedZone(zone || null);
      } catch (error) {
        console.error("Failed to load selected zone:", error);
        setSelectedZone(null);
      }
    },
    [loadZones],
  );

  return {
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
  };
}
