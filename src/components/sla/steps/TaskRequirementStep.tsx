"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import type { SLATaskRequirement } from "@/types/sla";
import {
  RECURRENCE_TYPES,
  WEEKDAY_OPTIONS,
  MONTH_NAMES,
  MAX_DAYS_IN_MONTH,
  getDaysArrayForMonth,
} from "@/constants/recurrence";

interface TaskRequirementStepProps {
  taskRequirements: SLATaskRequirement[];
  onTaskRequirementsChange: (requirements: SLATaskRequirement[]) => void;
}

export function TaskRequirementStep({
  taskRequirements,
  onTaskRequirementsChange,
}: TaskRequirementStepProps) {
  const addTask = () => {
    const newTask: SLATaskRequirement = {
      name: "",
      recurrenceType: "Daily",
      recurrenceConfig: { interval: 1 },
    };
    onTaskRequirementsChange([...taskRequirements, newTask]);
  };

  const removeTask = (index: number) => {
    onTaskRequirementsChange(taskRequirements.filter((_, i) => i !== index));
  };

  const updateTask = (
    index: number,
    field: keyof SLATaskRequirement,
    value: any,
  ) => {
    const updated = taskRequirements.map((task, i) => {
      if (i === index) {
        return { ...task, [field]: value };
      }
      return task;
    });
    onTaskRequirementsChange(updated);
  };

  const updateRecurrenceConfig = (index: number, config: any) => {
    updateTask(index, "recurrenceConfig", config);
  };

  const handleRecurrenceTypeChange = (index: number, type: string) => {
    let defaultConfig;
    switch (type) {
      case "Daily":
        defaultConfig = { interval: 1 };
        break;
      case "Weekly":
        defaultConfig = { interval: 1, daysOfWeek: [] };
        break;
      case "Monthly":
        defaultConfig = { interval: 1, daysOfMonth: [] };
        break;
      case "Yearly":
        defaultConfig = { interval: 1, selectedMonth: 1, daysOfMonth: [] };
        break;
      default:
        defaultConfig = { interval: 1 };
    }

    const updated = taskRequirements.map((task, i) => {
      if (i === index) {
        return {
          ...task,
          recurrenceType: type as "Daily" | "Weekly" | "Monthly" | "Yearly",
          recurrenceConfig: defaultConfig,
        };
      }
      return task;
    });
    onTaskRequirementsChange(updated);
  };

  const renderRecurrenceConfig = (task: SLATaskRequirement, index: number) => {
    const config = task.recurrenceConfig;

    switch (task.recurrenceType) {
      case "Daily":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Số lần lặp lại mỗi ngày
              </Label>
              <Input
                type="number"
                min="1"
                value={config.interval || 1}
                onChange={(e) =>
                  updateRecurrenceConfig(index, {
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 mt-2 bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="1"
              />
            </div>
          </div>
        );

      case "Weekly":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Số lần lặp lại mỗi tuần
              </Label>
              <Input
                type="number"
                min="1"
                value={config.interval || 1}
                onChange={(e) =>
                  updateRecurrenceConfig(index, {
                    ...config,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 mt-2 bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn các ngày trong tuần
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAY_OPTIONS.map((weekday) => {
                  const isSelected =
                    config.daysOfWeek?.includes(weekday.id) || false;
                  return (
                    <button
                      key={weekday.id}
                      type="button"
                      onClick={() => {
                        const currentDays = config.daysOfWeek || [];
                        const newDays = isSelected
                          ? currentDays.filter((d) => d !== weekday.id)
                          : [...currentDays, weekday.id];
                        updateRecurrenceConfig(index, {
                          ...config,
                          daysOfWeek: newDays,
                        });
                      }}
                      className={`px-3 py-4 rounded-lg font-medium transition-all text-center ${
                        isSelected
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="text-xs mb-1 opacity-80">
                        {weekday.shortLabel}
                      </div>
                      <div className="text-sm">{weekday.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "Monthly":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Số lần lặp lại mỗi tháng
              </Label>
              <Input
                type="number"
                min="1"
                value={config.interval || 1}
                onChange={(e) =>
                  updateRecurrenceConfig(index, {
                    ...config,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 mt-2 bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="1"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn các ngày trong tháng
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => i + 1).map(
                  (day) => {
                    const isSelected =
                      config.daysOfMonth?.includes(day) || false;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const currentDays = config.daysOfMonth || [];
                          const newDays = isSelected
                            ? currentDays.filter((d) => d !== day)
                            : [...currentDays, day].sort((a, b) => a - b);
                          updateRecurrenceConfig(index, {
                            ...config,
                            daysOfMonth: newDays,
                          });
                        }}
                        className={`aspect-square rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        );

      case "Yearly":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Số lần lặp lại mỗi năm
              </Label>
              <Input
                type="number"
                min="1"
                value={config.interval || 1}
                onChange={(e) =>
                  updateRecurrenceConfig(index, {
                    ...config,
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 mt-2 bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="1"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng
              </Label>
              <Select
                value={config.selectedMonth?.toString() || "1"}
                onValueChange={(value) => {
                  updateRecurrenceConfig(index, {
                    ...config,
                    selectedMonth: parseInt(value),
                    daysOfMonth: [], // Reset days when month changes
                  });
                }}
              >
                <SelectTrigger className="bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((month, monthIndex) => (
                    <SelectItem
                      key={monthIndex}
                      value={(monthIndex + 1).toString()}
                    >
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn các ngày trong tháng
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {getDaysArrayForMonth(config.selectedMonth || 1).map((day) => {
                  const isSelected = config.daysOfMonth?.includes(day) || false;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const currentDays = config.daysOfMonth || [];
                        const newDays = isSelected
                          ? currentDays.filter((d) => d !== day)
                          : [...currentDays, day].sort((a, b) => a - b);
                        updateRecurrenceConfig(index, {
                          ...config,
                          daysOfMonth: newDays,
                        });
                      }}
                      className={`aspect-square rounded-lg font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary rounded-full">
            <Calendar className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-center text-xl font-semibold text-primary mb-2">
          Cấu hình công việc
        </h3>
        <p className="text-center text-gray-600">
          Thiết lập các công việc và lịch trình thực hiện cho SLA
        </p>
      </div>

      {/* Task Requirements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">
            Danh sách công việc
          </h2>
          <Button
            onClick={addTask}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm công việc
          </Button>
        </div>

        {taskRequirements.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="p-4 bg-white rounded-full w-fit mx-auto mb-6 shadow-sm">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có công việc nào
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bắt đầu bằng cách thêm công việc đầu tiên cho SLA của bạn
            </p>
            {/* <Button
              onClick={addTask}
              className="bg-primary hover:bg-primary/90 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm công việc đầu tiên
            </Button> */}
          </div>
        ) : (
          <div className="space-y-6">
            {taskRequirements.map((task, index) => (
              <Card
                key={index}
                className="border-2 border-gray-100 hover:border-primary/20 transition-colors"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      Công việc {index + 1}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Task Name */}
                  <div>
                    <Label
                      htmlFor={`task-name-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Tên công việc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`task-name-${index}`}
                      placeholder="VD: Vệ sinh hàng ngày"
                      value={task.name}
                      onChange={(e) =>
                        updateTask(index, "name", e.target.value)
                      }
                      className="mt-2 bg-white border-[#e5e5e5]"
                    />
                  </div>

                  {/* Recurrence Type */}
                  <div>
                    <Label
                      htmlFor={`recurrence-type-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Loại lặp lại <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={task.recurrenceType}
                      onValueChange={(value) =>
                        handleRecurrenceTypeChange(index, value)
                      }
                    >
                      <SelectTrigger className="mt-2 bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent">
                        <SelectValue placeholder="Chọn loại lặp lại" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recurrence Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Cấu hình lặp lại
                    </Label>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {renderRecurrenceConfig(task, index)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {/* {taskRequirements.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-green-900 mb-2">
              Tóm tắt công việc:
            </h3>
            <div className="space-y-1">
              <p className="text-green-800">
                Tổng số công việc: <strong>{taskRequirements.length}</strong>
              </p>
              <div className="mt-2 space-y-1">
                {taskRequirements.map((task, index) => (
                  <div key={index} className="text-sm text-green-700">
                    • {task.name || `Công việc ${index + 1}`}:{" "}
                    {task.recurrenceType === "Daily"
                      ? `Hàng ngày (mỗi ${task.recurrenceConfig.interval} ngày)`
                      : task.recurrenceType === "Weekly"
                        ? `Hàng tuần (${task.recurrenceConfig.daysOfWeek?.length || 0} ngày/tuần)`
                        : task.recurrenceType === "Monthly"
                          ? `Hàng tháng (${task.recurrenceConfig.daysOfMonth?.length || 0} ngày/tháng)`
                          : task.recurrenceType === "Yearly"
                            ? `Hàng năm (${task.recurrenceConfig.monthDays?.length || 0} ngày/năm)`
                            : ""}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}
