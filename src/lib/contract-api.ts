import { api } from "./api";
import type { Contract, ContractFormData } from "@/types/contract";

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

export async function getContracts(): Promise<Contract[]> {
  const response = await api.get<Contract[] | { data: Contract[] } | any>(
    "/Contracts",
  );

  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }

  // If response is wrapped in a data property
  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  // If response has items property (common in paginated APIs)
  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  // Log the actual response structure for debugging
  console.log("Unexpected Contracts API response structure:", response);

  // Return empty array as fallback
  return [];
}

export async function getContractsPaginated(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ items: Contract[]; totalCount: number }> {
  const { pageNumber = 1, pageSize = 50 } = params; // Increased default pageSize and removed search

  let url = `/Contracts?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response = await api.get<any>(url);

  console.log("Contracts Paginated API Response:", response); // Debug log

  // Handle the actual API response format with 'content' field
  if (response && Array.isArray(response.content)) {
    return {
      items: response.content,
      totalCount: response.totalElements || response.content.length,
    };
  }

  // Handle different response formats (fallback)
  if (response && Array.isArray(response.items)) {
    return {
      items: response.items,
      totalCount: response.totalCount || response.items.length,
    };
  }

  if (response && Array.isArray(response.data)) {
    return {
      items: response.data,
      totalCount: response.totalCount || response.data.length,
    };
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      totalCount: response.length,
    };
  }

  console.log(
    "Unexpected Contracts Paginated API response structure:",
    response,
  );
  return { items: [], totalCount: 0 };
}

export async function getContractById(id: string): Promise<Contract> {
  return api.get<Contract>(`/Contracts/${id}`);
}

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

export async function deleteContract(id: string): Promise<void> {
  return api.delete(`/Contracts/${id}`);
}
