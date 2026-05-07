import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getLocations,
  getLocationsPaginated,
  getLocationsByClientId,
  searchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
} from "@/lib/location-api";
import type { PaginationParams } from "@/types/common";
import type { LocationFormData, Location } from "@/types/contract";

export function useLocations(
  params?: PaginationParams & { clientId?: string },
) {
  return useBaseQuery(["locations", params], () =>
    getLocationsPaginated(params || {}),
  );
}

export function useAllLocations() {
  return useBaseQuery(["locations", "all"], () => getLocations());
}

export function useLocation(id?: string) {
  return useBaseQuery(["locations", "detail", id], () => getLocationById(id!), {
    enabled: !!id,
  });
}

export function useLocationsByClient(
  clientId?: string,
  params?: PaginationParams,
) {
  return useBaseQuery(
    ["locations", "client", clientId, params],
    () => getLocationsByClientId(clientId!, params || {}),
    { enabled: !!clientId },
  );
}

export function useSearchLocations(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["locations", "search", keyword, pageNumber, pageSize],
    () => searchLocations(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateLocation() {
  return useBaseMutation(
    (data: LocationFormData) => createLocation(data),
    [["locations"]],
  );
}

export function useUpdateLocation() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: LocationFormData }) =>
      updateLocation(id, data),
    [["locations"]],
  );
}

export function useDeleteLocation() {
  return useBaseMutation((id: string) => deleteLocation(id), [["locations"]]);
}

export default useLocations;
