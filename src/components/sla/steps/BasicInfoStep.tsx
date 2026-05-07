"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { SLABasicInfo } from "@/types/sla";
import { useSLAFormData } from "@/hooks/useSLAFormData";
import { getContractsPaginated } from "@/lib/contract-api";
import { getEnvironmentTypes } from "@/lib/environment-type-api";
import { getZonesPaginated } from "@/lib/zone-api";
import { getWorkAreasPaginated } from "@/lib/work-area-api";

interface BasicInfoStepProps {
  data: SLABasicInfo;
  onChange: (data: SLABasicInfo) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [loading, setLoading] = useState(true);

  const {
    locationName,
    isLoading,
    handleInputChange,
    formatWorkAreaDisplay,
    clientId,
  } = useSLAFormData(data, onChange);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-black mb-6">
          Nhập thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contractId">Hợp đồng</Label>
            <SearchableSelect
              value={data.contractId}
              onValueChange={(value) => handleInputChange("contractId", value)}
              placeholder="Chọn hợp đồng"
              searchPlaceholder="Tìm kiếm hợp đồng..."
              emptyMessage="Không tìm thấy hợp đồng nào."
              queryKey={["contracts", "infinite"]}
              queryFn={async (page, pageSize, searchQuery) => {
                const response = await getContractsPaginated({
                  pageNumber: page,
                  pageSize,
                  search: searchQuery,
                });
                return {
                  content: response.items.map((item) => ({
                    ...item,
                    id: item.id!,
                  })),
                  pageNumber: page,
                  pageSize,
                  totalElements: response.totalCount,
                  totalPages: Math.ceil(response.totalCount / pageSize),
                  hasNextPage: page * pageSize < response.totalCount,
                  hasPreviousPage: page > 1,
                };
              }}
              useInfiniteLoading={true}
              pageSize={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slaName">Tên SLA</Label>
            <Input
              id="slaName"
              placeholder="Nhập tên SLA"
              value={data.slaName}
              onChange={(e) => handleInputChange("slaName", e.target.value)}
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationId">Địa điểm</Label>
            <SearchableSelect
              value={data.locationId}
              onValueChange={(value) => handleInputChange("locationId", value)}
              placeholder="Chọn địa điểm"
              searchPlaceholder="Tìm kiếm địa điểm..."
              emptyMessage="Không tìm thấy địa điểm nào."
              queryKey={["locations", "client", clientId]}
              queryFn={async (page, pageSize, searchQuery) => {
                if (!clientId) return {
                  content: [],
                  pageNumber: page,
                  pageSize,
                  totalElements: 0,
                  totalPages: 0,
                  hasNextPage: false,
                  hasPreviousPage: false,
                };

                const response = await import("@/lib/location-api").then((m) =>
                  m.getLocationsByClientId(clientId, {
                    pageNumber: page,
                    pageSize,
                  }),
                );

                // Auto-fill if only one location exists
                if (response.items.length === 1 && !data.locationId) {
                  setTimeout(() => handleInputChange("locationId", response.items[0].id!), 0);
                }

                return {
                  content: response.items.map((item) => ({
                    ...item,
                    id: item.id!,
                  })),
                  pageNumber: page,
                  pageSize,
                  totalElements: response.totalCount,
                  totalPages: Math.ceil(response.totalCount / pageSize),
                  hasNextPage: page * pageSize < response.totalCount,
                  hasPreviousPage: page > 1,
                };
              }}
              filters={{ clientId }}
              useInfiniteLoading={true}
              pageSize={10}
              disabled={!data.contractId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environmentTypeId">Loại môi trường</Label>
            <SearchableSelect
              value={data.environmentTypeId}
              onValueChange={(value) =>
                handleInputChange("environmentTypeId", value)
              }
              placeholder="Chọn loại môi trường"
              searchPlaceholder="Tìm kiếm loại môi trường..."
              emptyMessage="Không tìm thấy loại môi trường nào."
              queryKey={["environment-types", "infinite"]}
              queryFn={async (page, pageSize, searchQuery) => {
                try {
                  // Use the same API function as workflow form
                  const response = await getEnvironmentTypes({
                    pageNumber: page,
                    pageSize,
                    search: searchQuery,
                  });

                  // Ensure content is an array and filter out invalid items
                  const validContent = Array.isArray(response.content)
                    ? response.content.filter(
                        (item) => item && item.id && item.name,
                      )
                    : [];

                  return {
                    ...response,
                    content: validContent,
                  };
                } catch (error) {
                  console.error("Failed to load environment types:", error);
                  return {
                    content: [],
                    pageNumber: page,
                    pageSize,
                    totalElements: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                  };
                }
              }}
              useInfiniteLoading={true}
              pageSize={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoneId">Khu vực (Zone)</Label>
            <SearchableSelect
              value={data.zoneId}
              onValueChange={(value) => handleInputChange("zoneId", value)}
              placeholder="Chọn khu vực"
              searchPlaceholder="Tìm kiếm khu vực..."
              emptyMessage="Không tìm thấy khu vực nào."
              queryKey={["zones", "infinite", data.locationId]}
              queryFn={async (page, pageSize, searchQuery) => {
                const response = await getZonesPaginated({
                  pageNumber: page,
                  pageSize,
                  search: searchQuery,
                  locationId: data.locationId,
                });
                return {
                  content: response.items.map((item) => ({
                    ...item,
                    id: item.id!,
                  })),
                  pageNumber: page,
                  pageSize,
                  totalElements: response.totalCount,
                  totalPages: Math.ceil(response.totalCount / pageSize),
                  hasNextPage: page * pageSize < response.totalCount,
                  hasPreviousPage: page > 1,
                };
              }}
              filters={{ locationId: data.locationId }}
              useInfiniteLoading={true}
              pageSize={10}
              disabled={!data.locationId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workAreaId">Khu vực làm việc</Label>
            <SearchableSelect
              value={data.workAreaId}
              onValueChange={(value) => handleInputChange("workAreaId", value)}
              placeholder="Chọn khu vực làm việc"
              searchPlaceholder="Tìm kiếm khu vực làm việc..."
              emptyMessage="Không tìm thấy khu vực làm việc nào."
              queryKey={["work-areas", "infinite", data.zoneId]}
              queryFn={async (page, pageSize, searchQuery) => {
                const response = await getWorkAreasPaginated({
                  pageNumber: page,
                  pageSize,
                  search: searchQuery,
                  zoneId: data.zoneId,
                });
                return {
                  content: response.items.map((item) => ({
                    ...item,
                    id: item.id!,
                  })),
                  pageNumber: page,
                  pageSize,
                  totalElements: response.totalCount,
                  totalPages: Math.ceil(response.totalCount / pageSize),
                  hasNextPage: page * pageSize < response.totalCount,
                  hasPreviousPage: page > 1,
                };
              }}
              filters={{ zoneId: data.zoneId }}
              displayFormatter={formatWorkAreaDisplay}
              useInfiniteLoading={true}
              pageSize={10}
              disabled={!data.zoneId}
            />
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {/* {data.contractId &&
        data.slaName &&
        data.locationId &&
        data.zoneId &&
        data.workAreaId &&
        data.environmentTypeId && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">
              Tóm tắt thông tin SLA:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Hợp đồng:</span>
                <span className="text-blue-800 ml-2">
                  {selectedContract?.name || data.contractId}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Tên SLA:</span>
                <span className="text-blue-800 ml-2">{data.slaName}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Loại môi trường:
                </span>
                <span className="text-blue-800 ml-2">
                  {selectedEnvironmentType?.name || data.environmentTypeId}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Địa điểm:</span>
                <span className="text-blue-800 ml-2">
                  {selectedLocation?.name || data.locationId}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Khu vực:</span>
                <span className="text-blue-800 ml-2">
                  {selectedZone?.name || data.zoneId}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Khu vực làm việc:
                </span>
                <span className="text-blue-800 ml-2">
                  {selectedWorkArea
                    ? formatWorkAreaDisplay(selectedWorkArea)
                    : data.workAreaId}
                </span>
              </div>
            </div>
          </div>
        )} */}
    </div>
  );
}
