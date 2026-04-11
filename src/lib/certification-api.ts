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

// Export individual functions for full CRUD operations
export const {
  create: createCertification,
  getById: getCertificationById,
  update: updateCertification,
  delete: deleteCertification,
  getAll: getAllCertifications,
  search: searchCertifications,
} = certificationApi;

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
