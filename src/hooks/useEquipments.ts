import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  searchEquipmentsByKeyword,
} from "@/lib/equipment-api";
import type { PaginationParams } from "@/types/common";
import type {
  CreateEquipmentData,
  UpdateEquipmentData,
} from "@/lib/equipment-api";

export function useEquipments(params?: PaginationParams) {
  return useBaseQuery(["equipments", params], () => getEquipments(params));
}

export function useSearchEquipments(
  keyword?: string | null,
  pageNumber: number = 1,
  pageSize: number = 10,
) {
  return useBaseSearchQuery(
    ["equipments", "search", keyword, pageNumber, pageSize],
    () => searchEquipmentsByKeyword(keyword, pageNumber, pageSize),
  );
}

export function useCreateEquipment() {
  return useBaseMutation(
    (data: CreateEquipmentData) => createEquipment(data),
    [["equipments"]],
  );
}

export function useUpdateEquipment() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateEquipmentData }) =>
      updateEquipment(id, data),
    [["equipments"]],
  );
}

export function useDeleteEquipment() {
  return useBaseMutation((id: string) => deleteEquipment(id), [["equipments"]]);
}
