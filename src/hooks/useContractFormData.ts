"use client";

import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/lib/client-api";
import { getZones } from "@/lib/zone-api";

/**
 * Centralized data fetching hook for contract-related forms
 * This hook fetches all data needed by contract forms in one place
 */
export function useContractFormData() {
  // Fetch clients
  const {
    data: clients = [],
    isLoading: clientsLoading,
    error: clientsError,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  // Fetch zones
  const {
    data: zones = [],
    isLoading: zonesLoading,
    error: zonesError,
  } = useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });

  return {
    clients,
    zones,
    isLoading: clientsLoading || zonesLoading,
    clientsLoading,
    zonesLoading,
    error: clientsError || zonesError,
    clientsError,
    zonesError,
  };
}
