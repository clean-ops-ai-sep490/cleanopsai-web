import { useQuery } from "@tanstack/react-query";
import { getPPEs } from "@/lib/ppe-api";
import type { PaginationParams } from "@/types/common";

export function usePPEs(params?: PaginationParams) {
  return useQuery({
    queryKey: ["ppes", params],
    queryFn: () => getPPEs(params),
  });
}
