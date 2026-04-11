import { useQuery } from "@tanstack/react-query";
import { getEquipments } from "@/lib/equipment-api";
import type { PaginationParams } from "@/types/common";

export function useEquipments(params?: PaginationParams) {
  return useQuery({
    queryKey: ["equipments", params],
    queryFn: () => getEquipments(params),
  });
}
