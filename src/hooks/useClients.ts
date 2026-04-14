import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getClients,
  getClientsPaginated,
  searchClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
} from "@/lib/client-api";
import type { PaginationParams } from "@/types/common";
import type { ClientCreateData, ClientUpdateData } from "@/lib/client-api";
import type { Client } from "@/types/contract";

export function useClients(params?: PaginationParams) {
  return useBaseQuery(["clients", params], () =>
    getClientsPaginated(params || {}),
  );
}

export function useAllClients() {
  return useBaseQuery(["clients", "all"], () => getClients());
}

export function useClient(id?: string) {
  return useBaseQuery(["clients", "detail", id], () => getClientById(id!), {
    enabled: !!id,
  });
}

export function useSearchClients(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["clients", "search", keyword, pageNumber, pageSize],
    () => searchClients(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateClient() {
  return useBaseMutation(
    (data: ClientCreateData) => createClient(data),
    [["clients"]],
  );
}

export function useUpdateClient() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: ClientUpdateData }) =>
      updateClient(id, data),
    [["clients"]],
  );
}

export function useDeleteClient() {
  return useBaseMutation((id: string) => deleteClient(id), [["clients"]]);
}

export default useClients;
