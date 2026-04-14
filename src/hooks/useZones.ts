import {
  useBaseQuery,
  useBaseSearchQuery,
  useBaseMutation,
} from "./useBaseQuery";
import {
  getZones,
  getZonesPaginated,
  searchZones,
  createZone,
  updateZone,
  deleteZone,
  getZoneById,
} from "@/lib/zone-api";
import type { PaginationParams } from "@/types/common";
import type { ZoneFormData, Zone } from "@/types/contract";

export function useZones(params?: PaginationParams & { locationId?: string }) {
  return useBaseQuery(["zones", params], () => getZonesPaginated(params || {}));
}

export function useAllZones() {
  return useBaseQuery(["zones", "all"], () => getZones());
}

export function useZone(id?: string) {
  return useBaseQuery(["zones", "detail", id], () => getZoneById(id!), {
    enabled: !!id,
  });
}

export function useZonesByLocation(
  locationId?: string,
  params?: PaginationParams,
) {
  return useBaseQuery(
    ["zones", "location", locationId, params],
    () => getZonesPaginated({ ...params, locationId }),
    { enabled: !!locationId },
  );
}

export function useSearchZones(
  keyword?: string | null,
  pageNumber = 1,
  pageSize = 10,
) {
  return useBaseSearchQuery(
    ["zones", "search", keyword, pageNumber, pageSize],
    () => searchZones(keyword ?? "", pageNumber, pageSize),
  );
}

export function useCreateZone() {
  return useBaseMutation((data: ZoneFormData) => createZone(data), [["zones"]]);
}

export function useUpdateZone() {
  return useBaseMutation(
    ({ id, data }: { id: string; data: ZoneFormData }) => updateZone(id, data),
    [["zones"]],
  );
}

export function useDeleteZone() {
  return useBaseMutation((id: string) => deleteZone(id), [["zones"]]);
}

export default useZones;
