"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SLABasicInfo } from "@/types/sla";

interface BasicInfoStepProps {
  data: SLABasicInfo;
  onChange: (data: SLABasicInfo) => void;
}

export function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const handleInputChange = (field: keyof SLABasicInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-black mb-6">
          Nhập thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contractNumber">Số hợp đồng</Label>
            <Input
              id="contractNumber"
              placeholder="Nhập số hợp đồng"
              value={data.contractNumber}
              onChange={(e) =>
                handleInputChange("contractNumber", e.target.value)
              }
              className="bg-gray-100"
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
            <Label htmlFor="serviceType">Loại dịch vụ</Label>
            <Select
              value={data.serviceType}
              onValueChange={(value) => handleInputChange("serviceType", value)}
            >
              <SelectTrigger className="bg-gray-100">
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaning-office">
                  Vệ sinh văn phòng
                </SelectItem>
                <SelectItem value="cleaning-industrial">
                  Vệ sinh công nghiệp
                </SelectItem>
                <SelectItem value="cleaning-hospital">
                  Vệ sinh bệnh viện
                </SelectItem>
                <SelectItem value="cleaning-school">
                  Vệ sinh trường học
                </SelectItem>
                <SelectItem value="cleaning-residential">
                  Vệ sinh khu dân cư
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Môi trường áp dụng</Label>
            <Select
              value={data.environment}
              onValueChange={(value) => handleInputChange("environment", value)}
            >
              <SelectTrigger className="bg-gray-100">
                <SelectValue placeholder="Chọn môi trường" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Trong nhà</SelectItem>
                <SelectItem value="outdoor">Ngoài trời</SelectItem>
                <SelectItem value="mixed">Hỗn hợp</SelectItem>
                <SelectItem value="specialized">Chuyên biệt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {data.contractNumber &&
        data.slaName &&
        data.serviceType &&
        data.environment && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">
              Tóm tắt thông tin SLA:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Số hợp đồng:</span>
                <span className="text-blue-800 ml-2">
                  {data.contractNumber}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Tên SLA:</span>
                <span className="text-blue-800 ml-2">{data.slaName}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Loại dịch vụ:</span>
                <span className="text-blue-800 ml-2">
                  {data.serviceType === "cleaning-office" &&
                    "Vệ sinh văn phòng"}
                  {data.serviceType === "cleaning-industrial" &&
                    "Vệ sinh công nghiệp"}
                  {data.serviceType === "cleaning-hospital" &&
                    "Vệ sinh bệnh viện"}
                  {data.serviceType === "cleaning-school" &&
                    "Vệ sinh trường học"}
                  {data.serviceType === "cleaning-residential" &&
                    "Vệ sinh khu dân cư"}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Môi trường:</span>
                <span className="text-blue-800 ml-2">
                  {data.environment === "indoor" && "Trong nhà"}
                  {data.environment === "outdoor" && "Ngoài trời"}
                  {data.environment === "mixed" && "Hỗn hợp"}
                  {data.environment === "specialized" && "Chuyên biệt"}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
