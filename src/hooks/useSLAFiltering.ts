import { useState, useMemo } from "react";
import type { SLA } from "@/types/sla";

export function useSLAFiltering(slas: SLA[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const filteredSLAs = useMemo(() => {
    return slas.filter((sla) => {
      const matchesSearch =
        sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sla.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesServiceType =
        serviceTypeFilter === "all" || sla.serviceType === serviceTypeFilter;

      return matchesSearch && matchesServiceType;
    });
  }, [slas, searchTerm, serviceTypeFilter]);

  return {
    searchTerm,
    setSearchTerm,
    serviceTypeFilter,
    setServiceTypeFilter,
    filteredSLAs,
  };
}
