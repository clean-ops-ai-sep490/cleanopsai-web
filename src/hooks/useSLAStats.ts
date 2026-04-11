import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSLAs, getSLAShifts, getSLATasks } from "@/lib/sla-api";

interface SLAStats {
  totalSLAs: number;
  activeSLAs: number;
  totalShifts: number;
  totalTasks: number;
}

/**
 * SLA Stats Hook - Handles SLA statistics data fetching
 * Follows SRP by focusing only on stats data operations
 */
export function useSLAStats() {
  const { data: slas = [], isLoading: slasLoading } = useQuery({
    queryKey: ["slas"],
    queryFn: getSLAs,
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ["sla-shifts"],
    queryFn: getSLAShifts,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["sla-tasks"],
    queryFn: getSLATasks,
  });

  const isLoading = slasLoading || shiftsLoading || tasksLoading;

  const stats = useMemo<SLAStats>(() => {
    // Ensure data is arrays before processing
    const slasArray = Array.isArray(slas) ? slas : [];
    const shiftsArray = Array.isArray(shifts) ? shifts : [];
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    return {
      totalSLAs: slasArray.length,
      activeSLAs: slasArray.length, // All SLAs are considered active since there's no status field
      totalShifts: shiftsArray.length,
      totalTasks: tasksArray.length,
    };
  }, [slas, shifts, tasks]);

  return {
    stats,
    isLoading,
  };
}
