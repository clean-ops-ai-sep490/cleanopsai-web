import { createSearchableApi } from "./api-crud-factory";
import {
  parseArrayResponse,
  parsePaginatedResponse,
} from "./api-response-parser";
import { api } from "./api";
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

// Explicit wrappers for CRUD/search to ensure functions are available
export async function createEquipment(
  data: CreateEquipmentData,
): Promise<Equipment> {
  return equipmentApi.create(data);
}

export async function getEquipmentById(id: string): Promise<Equipment> {
  return equipmentApi.getById(id);
}

export async function updateEquipment(
  id: string,
  data: UpdateEquipmentData,
): Promise<Equipment> {
  return equipmentApi.update(id, data);
}

export async function deleteEquipment(id: string): Promise<number> {
  // Backend controller returns an integer indicating number of records deleted
  const result = await api.delete<number>(
    `/Equipments/${encodeURIComponent(id)}`,
  );
  return result ?? 0;
}

export async function getAllEquipments(): Promise<Equipment[]> {
  return equipmentApi.getAll();
}

export async function searchEquipments(
  query: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  additionalParams: Record<string, any> = {},
): Promise<PaginatedResponse<Equipment>> {
  return equipmentApi.search(query, pageNumber, pageSize, additionalParams);
}

// Custom paginated function
export async function getEquipments(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Equipment>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return equipmentApi.getPaginated(pageNumber, pageSize, { search });
}

// Get equipment types (categories) from API
export async function getEquipmentTypes(): Promise<string[]> {
  const response = await api.get<any>("/Equipments/types");
  return parseArrayResponse<string>(response);
}

// Get equipments by type
export async function getEquipmentsByType(type: string): Promise<Equipment[]> {
  const response = await api.get<any>(
    `/Equipments/by-type?type=${encodeURIComponent(type)}`,
  );
  return parseArrayResponse<Equipment>(response);
}

// Get equipments by a list of ids
export async function getEquipmentsByIds(ids: string[]): Promise<Equipment[]> {
  if (!ids || ids.length === 0) return [];
  const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
  const response = await api.get<any>(`/Equipments/batch?${query}`);
  return parseArrayResponse<Equipment>(response);
}

// Search equipments using backend's dedicated search endpoint
export async function searchEquipmentsByKeyword(
  keyword: string | undefined | null,
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<PaginatedResponse<Equipment>> {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", String(keyword));
  params.append("pageNumber", String(pageNumber));
  params.append("pageSize", String(pageSize));

  const response = await api.get<any>(
    `/Equipments/search?${params.toString()}`,
  );
  return parsePaginatedResponse<Equipment>(response, pageNumber, pageSize);
}
