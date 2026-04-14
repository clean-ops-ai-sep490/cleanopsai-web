import { createSearchableApi } from "./api-crud-factory";
import { api } from "./api";
import type { Contract, ContractFormData } from "@/types/contract";
import type { PaginatedRequest } from "@/types/common";

// Legacy interface for backward compatibility
export interface ContractsPaginatedRequest extends PaginatedRequest {}

// Create CRUD API using factory for basic operations
const contractApi = createSearchableApi<
  Contract,
  ContractFormData,
  ContractFormData
>("/Contracts");

// Export individual functions for backward compatibility (except create/update which need FormData)
export const {
  getById: getContractById,
  delete: deleteContract,
  getAll: getContracts,
  getPaginated: getContractsPaginatedNew,
  search: searchContracts,
} = contractApi;

// Custom create function that handles FormData
export async function createContract(
  data: ContractFormData,
): Promise<Contract> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("clientId", data.clientId);

  if (data.file) {
    formData.append("file", data.file);
  }

  return api.post<Contract>("/Contracts", formData);
}

// Custom update function that handles FormData
export async function updateContract(
  id: string,
  data: ContractFormData,
): Promise<Contract> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("clientId", data.clientId);

  if (data.file) {
    formData.append("file", data.file);
  }

  return api.put<Contract>(`/Contracts/${id}`, formData);
}

// Legacy function for backward compatibility
export async function getContractsPaginated(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ items: Contract[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 10, search, ...rest } = params;

  try {
    const response = await contractApi.getPaginated(pageNumber, pageSize, {
      search,
      ...rest,
    });

    return {
      items: response.content,
      totalCount: response.totalElements,
    };
  } catch (error) {
    console.error("Failed to load contracts:", error);
    return { items: [], totalCount: 0 };
  }
}
