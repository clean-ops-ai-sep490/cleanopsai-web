"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Users, Plus, Trash2 } from "lucide-react";
import type { SLAStaffRequirement } from "@/types/sla";
import { PREDEFINED_SHIFTS, type WorkShift } from "@/types/work-shifts";

interface StaffRequirementStepProps {
  staffRequirements: SLAStaffRequirement[];
  onStaffRequirementsChange: (requirements: SLAStaffRequirement[]) => void;
}

export function StaffRequirementStep({
  staffRequirements,
  onStaffRequirementsChange,
}: StaffRequirementStepProps) {
  const addStaffRequirement = () => {
    const newRequirement: SLAStaffRequirement = {
      name: "",
      startTime: "",
      endTime: "",
      requiredWorker: 1,
      breakTime: 0,
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

  const handleShiftSelect = (index: number, shiftId: string) => {
    const selectedShift = PREDEFINED_SHIFTS.find(
      (shift) => shift.id === shiftId,
    );
    if (selectedShift) {
      const updated = staffRequirements.map((req, i) => {
        if (i === index) {
          return {
            ...req,
            name: selectedShift.name,
            startTime: selectedShift.startTime,
            endTime: selectedShift.endTime,
          };
        }
        return req;
      });
      onStaffRequirementsChange(updated);
    }
  };

  const removeStaffRequirement = (index: number) => {
    const updated = staffRequirements.filter((_, i) => i !== index);
    onStaffRequirementsChange(updated);
  };

  const getTotalStaff = () => {
    return staffRequirements.reduce(
      (total, req) => total + req.requiredWorker,
      0,
    );
  };

  // Helper function to format time for display
  const formatTimeForDisplay = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-blue-100 p-6 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-center text-lg font-medium text-primary mb-2">
          Bố trí ca làm việc
        </h3>
        <p className="text-center text-gray-600 text-sm">
          Thiết lập ca làm việc và số lượng nhân viên cần thiết
        </p>
      </div>

      {/* Staff Requirements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">
            Ca làm việc và nhân sự
          </h2>
          <Button
            onClick={addStaffRequirement}
            className="bg-primary hover:bg-primary/90"
          >
            Thêm ca làm việc
          </Button>
        </div>

        {staffRequirements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có ca làm việc
            </h3>
            <p className="text-gray-600 mb-4">Thêm ca làm việc đầu tiên</p>
          </div>
        ) : (
          <div className="space-y-4">
            {staffRequirements.map((requirement, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`shift-${index}`}>Chọn ca làm việc</Label>
                      <Select
                        onValueChange={(value) =>
                          handleShiftSelect(index, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ca" />
                        </SelectTrigger>
                        <SelectContent>
                          {PREDEFINED_SHIFTS.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`startTime-${index}`}>Giờ bắt đầu</Label>
                      <TimePicker
                        value={requirement.startTime}
                        onChange={(time) =>
                          updateStaffRequirement(index, "startTime", time)
                        }
                        placeholder="Chọn giờ bắt đầu"
                        format="24"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`endTime-${index}`}>Giờ kết thúc</Label>
                      <TimePicker
                        value={requirement.endTime}
                        onChange={(time) =>
                          updateStaffRequirement(index, "endTime", time)
                        }
                        placeholder="Chọn giờ kết thúc"
                        format="24"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`requiredWorker-${index}`}>
                        Số nhân viên
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStaffRequirement(
                              index,
                              "requiredWorker",
                              Math.max(1, requirement.requiredWorker - 1),
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          -
                        </Button>
                        <Input
                          id={`requiredWorker-${index}`}
                          type="number"
                          min="1"
                          value={requirement.requiredWorker}
                          onChange={(e) =>
                            updateStaffRequirement(
                              index,
                              "requiredWorker",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStaffRequirement(
                              index,
                              "requiredWorker",
                              requirement.requiredWorker + 1,
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`breakTime-${index}`}>
                        Thời gian nghỉ (phút)
                      </Label>
                      <Input
                        id={`breakTime-${index}`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={requirement.breakTime}
                        onChange={(e) =>
                          updateStaffRequirement(
                            index,
                            "breakTime",
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStaffRequirement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa ca làm việc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {staffRequirements.length > 0 && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={addStaffRequirement}
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm ca làm việc khác
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      {staffRequirements.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-green-900 mb-2">
              Tóm tắt ca làm việc:
            </h3>
            <div className="space-y-1">
              <p className="text-green-800">
                Tổng số nhân viên: <strong>{getTotalStaff()}</strong> người
              </p>
              <p className="text-green-800">
                Số ca làm việc: <strong>{staffRequirements.length}</strong> ca
              </p>
              <div className="mt-2 space-y-1">
                {staffRequirements.map((req, index) => (
                  <div key={index} className="text-sm text-green-700">
                    • {req.name || `Ca ${index + 1}`}:{" "}
                    {formatTimeForDisplay(req.startTime)} -{" "}
                    {formatTimeForDisplay(req.endTime)} ({req.requiredWorker}{" "}
                    người)
                    {req.breakTime > 0 && ` - Nghỉ ${req.breakTime} phút`}
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
