import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { CreateCertificationData, UpdateCertificationData } from "@/types/skill";

export function useCertifications(params?: PaginationParams) {
  return useQuery({
    queryKey: ["certifications", params],
    queryFn: () => getCertifications(params),
  });
}

export function useAllCertifications() {
  return useQuery({
    queryKey: ["certifications", "all"],
    queryFn: () => getAllCertifications(),
  });
}

export function useSearchCertifications(keyword?: string | null, pageNumber = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["certifications", "search", keyword, pageNumber, pageSize],
    queryFn: () => searchCertifications(keyword ?? "", pageNumber, pageSize),
    keepPreviousData: true,
  });
}

export function useCreateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCertificationData) => createCertification(data),
    onSuccess: () => qc.invalidateQueries(["certifications"]),
  });
}

export function useUpdateCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCertificationData }) =>
      updateCertification(id, data),
    onSuccess: () => qc.invalidateQueries(["certifications"]),
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCertification(id),
    onSuccess: (deletedCount: number) => {
      if ((deletedCount ?? 0) > 0) qc.invalidateQueries(["certifications"]);
    },
  });
}
export function useCertificationsByCategory(category?: string) {
  return useQuery({
    queryKey: ["certifications", "category", category],
    queryFn: () => getCertificationsByCategory(category ?? ""),
    enabled: !!category, // chỉ gọi khi có category
  });
}

export default useCertifications;
