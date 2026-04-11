"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { SLABasicInfo } from "@/types/sla";
import { useBasicInfoForm } from "@/hooks/useBasicInfoForm";

interface BasicInfoStepProps {
  data: SLABasicInfo;
  onChange: (data: SLABasicInfo) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const [loading, setLoading] = useState(true);

  const {
    locationName,
    loadContracts,
    loadWorkAreas,
    loadEnvironmentTypes,
    loadZones,
    handleInputChange,
    formatWorkAreaDisplay,
  } = useBasicInfoForm(data, onChange);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a80a2]"></div>
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
              loadItems={loadContracts}
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
            <Input
              id="locationId"
              value={locationName}
              placeholder={
                data.contractId && !locationName
                  ? "Đang tải địa điểm..."
                  : "Được chọn từ hợp đồng"
              }
              readOnly
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
              loadItems={loadEnvironmentTypes}
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
              loadItems={loadZones}
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
              loadItems={loadWorkAreas}
              displayFormatter={formatWorkAreaDisplay}
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
