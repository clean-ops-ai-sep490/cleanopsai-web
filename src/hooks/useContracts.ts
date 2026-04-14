import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getContracts,
  getContractsPaginated,
  searchContracts,
  createContract,
  updateContract,
  deleteContract,
  getContractById,
} from "@/lib/contract-api";
import { ContractService } from "@/lib/services/contract.service";
import type { PaginationParams } from "@/types/common";
import type { ContractFormData, Contract } from "@/types/contract";

export function useContracts(params?: PaginationParams) {
  return useBaseQuery(["contracts", params], () =>
    getContractsPaginated(params || {}),
  );
}

export function useAllContracts() {
  return useBaseQuery(["contracts", "all"], () => getContracts());
}

export function useContract(id?: string) {
  return useBaseQuery(["contracts", "detail", id], () => getContractById(id!), {
    enabled: !!id,
  });
}

// Hook for contracts with enriched client data
export function useContractsWithClients() {
  return useBaseQuery(
    ["contracts-with-clients"],
    ContractService.getContractsWithClients,
  );
}

export function useSearchContracts(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["contracts", "search", keyword, pageNumber, pageSize],
    () => searchContracts(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateContract() {
  return useBaseMutation(
    (data: ContractFormData) => createContract(data),
    [["contracts"], ["contracts-with-clients"]], // Invalidate both queries
  );
}

export function useUpdateContract() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: ContractFormData }) =>
      updateContract(id, data),
    [["contracts"], ["contracts-with-clients"]],
  );
}

export function useDeleteContract() {
  return useBaseMutation(
    (id: string) => deleteContract(id),
    [["contracts"], ["contracts-with-clients"]],
  );
}

export default useContracts;
