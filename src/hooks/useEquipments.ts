import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  searchEquipmentsByKeyword,
} from "@/lib/equipment-api";
import type { PaginationParams } from "@/types/common";
import type { CreateEquipmentData, UpdateEquipmentData } from "@/lib/equipment-api";

export function useEquipments(params?: PaginationParams) {
  return useQuery({
    queryKey: ["equipments", params],
    queryFn: () => getEquipments(params),
  });
}

export function useSearchEquipments(
  keyword?: string | null,
  pageNumber: number = 1,
  pageSize: number = 10,
) {
  return useQuery({
    queryKey: ["equipments", "search", keyword, pageNumber, pageSize],
    queryFn: () => searchEquipmentsByKeyword(keyword, pageNumber, pageSize),
    keepPreviousData: true,
  });
}

export function useCreateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipmentData) => createEquipment(data),
    onSuccess: () => qc.invalidateQueries(["equipments"]),
  });
}

export function useUpdateEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentData }) =>
      updateEquipment(id, data),
    onSuccess: () => qc.invalidateQueries(["equipments"]),
  });
}

export function useDeleteEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: (deletedCount: number) => {
      if ((deletedCount ?? 0) > 0) qc.invalidateQueries(["equipments"]);
    },
  });
}
