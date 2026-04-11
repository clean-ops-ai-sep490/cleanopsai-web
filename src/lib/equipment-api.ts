import { createSearchableApi } from "./api-crud-factory";
import type { PaginatedResponse, PaginationParams } from "@/types/common";

// Equipment type definition
export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface CreateEquipmentData {
  name: string;
  type: string;
  description?: string;
}

export interface UpdateEquipmentData {
  name?: string;
  type?: string;
  description?: string;
}

// Equipment API using CRUD factory
const equipmentApi = createSearchableApi<
  Equipment,
  CreateEquipmentData,
  UpdateEquipmentData
>("/Equipments");

// Export individual functions
export const {
  create: createEquipment,
  getById: getEquipmentById,
  update: updateEquipment,
  delete: deleteEquipment,
  getAll: getAllEquipments,
  search: searchEquipments,
} = equipmentApi;

// Custom paginated function
export async function getEquipments(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Equipment>> {
  const { pageNumber = 1, pageSize = 100, search } = params;
  return equipmentApi.getPaginated(pageNumber, pageSize, { search });
}
