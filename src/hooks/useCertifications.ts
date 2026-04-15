import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getCertifications,
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  searchCertifications,
  getCertificationsByCategory,
} from "@/lib/certification-api";
import type { PaginationParams } from "@/types/common";
import type {
  CreateCertificationData,
  UpdateCertificationData,
} from "@/types/skill";

export function useCertifications(params?: PaginationParams) {
  return useBaseQuery(["certifications", params], () =>
    getCertifications(params),
  );
}

export function useAllCertifications() {
  return useBaseQuery(["certifications", "all"], () => getAllCertifications());
}

export function useSearchCertifications(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["certifications", "search", keyword, pageNumber, pageSize],
    () => searchCertifications(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateCertification() {
  return useBaseMutation(
    (data: CreateCertificationData) => createCertification(data),
    [["certifications"]],
  );
}

export function useUpdateCertification() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: UpdateCertificationData }) =>
      updateCertification(id, data),
    [["certifications"]],
  );
}

export function useDeleteCertification() {
  return useBaseMutation(
    (id: string) => deleteCertification(id),
    [["certifications"]],
  );
}

export function useCertificationsByCategory(category?: string) {
  return useBaseQuery(
    ["certifications", "category", category],
    () => getCertificationsByCategory(category ?? ""),
    { enabled: !!category }, // chỉ gọi khi có category
  );
}

export default useCertifications;
