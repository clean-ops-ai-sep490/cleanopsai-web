import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type { PaginatedResponse, PaginationParams } from "@/types/common";
import type {
  Certification,
  CreateCertificationData,
  UpdateCertificationData,
} from "@/types/skill";

// Certification API using CRUD factory with consistent endpoint casing
const certificationApi = createSearchableApi<
  Certification,
  CreateCertificationData,
  UpdateCertificationData
>("/Certifications");

// Explicit wrappers for CRUD/search to match backend behavior
export async function createCertification(data: CreateCertificationData): Promise<Certification> {
  return certificationApi.create(data);
}

export async function getCertificationById(id: string): Promise<Certification> {
  return certificationApi.getById(id);
}

export async function updateCertification(id: string, data: UpdateCertificationData): Promise<Certification> {
  return certificationApi.update(id, data);
}

export async function deleteCertification(id: string): Promise<number> {
  // Backend returns number of records deleted
  const result = await api.delete<number>(`/Certifications/${encodeURIComponent(id)}`);
  return result ?? 0;
}

export async function getAllCertifications(): Promise<Certification[]> {
  return certificationApi.getAll();
}

export async function searchCertifications(
  query: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  additionalParams: Record<string, any> = {},
): Promise<PaginatedResponse<Certification>> {
  return certificationApi.search(query, pageNumber, pageSize, additionalParams);
}

// Custom paginated function to maintain existing interface
export async function getCertifications(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Certification>> {
  const { pageNumber = 1, pageSize = 10, search } = params;
  return certificationApi.getPaginated(pageNumber, pageSize, { search });
}

// Legacy function for backward compatibility (get all without pagination)
export async function getAllCertificationsList(): Promise<Certification[]> {
  const response = await api.get<any>("/Certifications");
  return parseArrayResponse<Certification>(response);
}

// Get all certification categories
export async function getCertificationCategories(): Promise<any[]> {
  const response = await api.get<any>("/Certifications/categories");
  return parseArrayResponse<any>(response);
}

// Get certifications by category name
export async function getCertificationsByCategory(
  category: string,
): Promise<Certification[]> {
  const response = await api.get<any>(
    `/Certifications/by-category?category=${encodeURIComponent(category)}`,
  );
  return parseArrayResponse<Certification>(response);
}

// Get certifications by a list of ids
export async function getCertificationsByIds(
  ids: string[],
): Promise<Certification[]> {
  if (!ids || ids.length === 0) return [];
  const query = ids.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
  const response = await api.get<any>(`/Certifications/batch?${query}`);
  return parseArrayResponse<Certification>(response);
}

// Get certifications for a specific worker
export async function getCertificationsByWorkerId(workerId: string): Promise<Certification[]> {
  if (!workerId) return [];
  const response = await api.get<any>(`/Certifications/worker/${encodeURIComponent(workerId)}/certifications`);
  return parseArrayResponse<Certification>(response);
}
