"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Plus } from "lucide-react";
import type { Zone, WorkArea, SLAStaffRequirement } from "@/types/sla";

interface StaffRequirementStepProps {
  staffRequirements: SLAStaffRequirement[];
  onStaffRequirementsChange: (requirements: SLAStaffRequirement[]) => void;
  zones: Zone[];
  workAreas: WorkArea[];
}

export function StaffRequirementStep({
  staffRequirements,
  onStaffRequirementsChange,
  zones,
  workAreas,
}: StaffRequirementStepProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");

  // Mock data for staff positions
  const staffPositions = [
    { value: "cleaner", label: "Nhân viên vệ sinh" },
    { value: "supervisor", label: "Giám sát viên" },
    { value: "team-leader", label: "Trưởng nhóm" },
    { value: "specialist", label: "Chuyên viên kỹ thuật" },
  ];

  const workShifts = [
    { value: "morning", label: "Ca sáng (6:00 - 14:00)" },
    { value: "afternoon", label: "Ca chiều (14:00 - 22:00)" },
    { value: "night", label: "Ca đêm (22:00 - 6:00)" },
    { value: "full-day", label: "Cả ngày (8:00 - 17:00)" },
  ];

  const addStaffRequirement = () => {
    const newRequirement: SLAStaffRequirement = {
      position: "",
      quantity: 1,
      workTime: "",
    };
    onStaffRequirementsChange([...staffRequirements, newRequirement]);
  };

  const updateStaffRequirement = (
    index: number,
    field: keyof SLAStaffRequirement,
    value: string | number,
  ) => {
    const updated = staffRequirements.map((req, i) => {
      if (i === index) {
        return { ...req, [field]: value };
      }
      return req;
    });
    onStaffRequirementsChange(updated);
  };

  const removeStaffRequirement = (index: number) => {
    const updated = staffRequirements.filter((_, i) => i !== index);
    onStaffRequirementsChange(updated);
  };

  const getTotalStaff = () => {
    return staffRequirements.reduce((total, req) => total + req.quantity, 0);
  };

  const getWorkAreasByZone = (zoneId: string) => {
    return workAreas.filter((area) => area.zoneId === zoneId);
  };

  return (
    <div className="space-y-8">
      {/* Work Schedule Section */}
      <div className="bg-blue-100 p-6 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-12 w-12 text-[#1a80a2]" />
        </div>
        <h3 className="text-center text-lg font-medium text-[#1a80a2] mb-2">
          Thêm ca làm việc
        </h3>
        <p className="text-center text-gray-600 text-sm">
          Thiết lập lịch làm việc cho từng khu vực
        </p>
      </div>

      {/* Staff Requirements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">
            Yêu cầu về nhân sự
          </h2>
          <Button onClick={addStaffRequirement} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm vị trí
          </Button>
        </div>

        {staffRequirements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có yêu cầu nhân sự
            </h3>
            <p className="text-gray-600 mb-4">Thêm yêu cầu nhân sự đầu tiên</p>
            <Button
              onClick={addStaffRequirement}
              className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm yêu cầu
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    STT
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Vị trí
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Số lượng
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Thời gian
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffRequirements.map((requirement, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 text-center">{index + 1}</td>
                    <td className="py-4 px-4">
                      <Select
                        value={requirement.position}
                        onValueChange={(value) =>
                          updateStaffRequirement(index, "position", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffPositions.map((position) => (
                            <SelectItem
                              key={position.value}
                              value={position.value}
                            >
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStaffRequirement(
                              index,
                              "quantity",
                              Math.max(1, requirement.quantity - 1),
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={requirement.quantity}
                          onChange={(e) =>
                            updateStaffRequirement(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStaffRequirement(
                              index,
                              "quantity",
                              requirement.quantity + 1,
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Select
                        value={requirement.workTime}
                        onValueChange={(value) =>
                          updateStaffRequirement(index, "workTime", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn ca làm việc" />
                        </SelectTrigger>
                        <SelectContent>
                          {workShifts.map((shift) => (
                            <SelectItem key={shift.value} value={shift.value}>
                              {shift.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStaffRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {staffRequirements.length > 0 && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={addStaffRequirement}
              className="text-[#1a80a2] hover:text-[#1a80a2]/80 text-sm font-medium"
            >
              + Thêm khu vực
            </button>
          </div>
        )}
      </div>

      {/* Zone Work Areas Summary */}
      {zones.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">
            Khu vực được phân công
          </h3>
          <div className="space-y-4">
            {zones.map((zone) => {
              const zoneWorkAreas = getWorkAreasByZone(zone.id);
              const totalArea = zoneWorkAreas.reduce(
                (sum, area) => sum + area.area,
                0,
              );

              return (
                <Card key={zone.id} className="border-l-4 border-l-[#1a80a2]">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-black">{zone.name}</h4>
                        <p className="text-sm text-gray-600">
                          {zoneWorkAreas.length} khu vực làm việc • {totalArea}
                          m²
                        </p>
                        {zoneWorkAreas.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {zoneWorkAreas.map((area) => (
                              <span
                                key={area.id}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {area.name} ({area.area}m²)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedZoneId(zone.id);
                          setShowScheduleModal(true);
                        }}
                      >
                        Chọn ca làm việc
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {staffRequirements.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-green-900 mb-2">
              Tóm tắt nhân sự:
            </h3>
            <div className="space-y-1">
              <p className="text-green-800">
                Tổng số nhân viên: <strong>{getTotalStaff()}</strong> người
              </p>
              <p className="text-green-800">
                Số vị trí công việc: <strong>{staffRequirements.length}</strong>{" "}
                vị trí
              </p>
              <div className="mt-2">
                {staffRequirements.map((req, index) => (
                  <div key={index} className="text-sm text-green-700">
                    •{" "}
                    {staffPositions.find((p) => p.value === req.position)
                      ?.label || req.position}
                    : {req.quantity} người
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
