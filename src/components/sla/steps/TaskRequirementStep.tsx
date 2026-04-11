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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import type { SLATaskRequirement } from "@/types/sla";

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
        defaultConfig = { interval: 1, monthDays: [] };
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

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const;
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const renderRecurrenceConfig = (task: SLATaskRequirement, index: number) => {
    const config = task.recurrenceConfig;

    switch (task.recurrenceType) {
      case "Daily":
        return (
          <div className="space-y-4">
            <div>
              <Label>Lặp lại mỗi (ngày)</Label>
              <Input
                type="number"
                min="1"
                value={config.interval || 1}
                onChange={(e) =>
                  updateRecurrenceConfig(index, {
                    interval: parseInt(e.target.value) || 1,
                  })
                }
                className="w-20"
              />
            </div>
          </div>
        );

      case "Weekly":
        return (
          <div className="space-y-4">
            <div>
              <Label>Lặp lại mỗi (tuần)</Label>
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
                className="w-20"
              />
            </div>
            <div>
              <Label>Các ngày trong tuần</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${index}-${day}`}
                      checked={config.daysOfWeek?.includes(day) || false}
                      onCheckedChange={(checked) => {
                        const currentDays = config.daysOfWeek || [];
                        const newDays = checked
                          ? [...currentDays, day]
                          : currentDays.filter((d) => d !== day);
                        updateRecurrenceConfig(index, {
                          ...config,
                          daysOfWeek: newDays,
                        });
                      }}
                    />
                    <Label htmlFor={`${index}-${day}`} className="text-sm">
                      {day === "Monday"
                        ? "Thứ 2"
                        : day === "Tuesday"
                          ? "Thứ 3"
                          : day === "Wednesday"
                            ? "Thứ 4"
                            : day === "Thursday"
                              ? "Thứ 5"
                              : day === "Friday"
                                ? "Thứ 6"
                                : day === "Saturday"
                                  ? "Thứ 7"
                                  : "Chủ nhật"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Monthly":
        return (
          <div className="space-y-4">
            <div>
              <Label>Lặp lại mỗi (tháng)</Label>
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
                className="w-20"
              />
            </div>
            <div>
              <Label>Các ngày trong tháng</Label>
              <Input
                placeholder="VD: 1,15,30 (cách nhau bởi dấu phẩy)"
                value={config.daysOfMonth?.join(",") || ""}
                onChange={(e) => {
                  const days = e.target.value
                    .split(",")
                    .map((d) => parseInt(d.trim()))
                    .filter((d) => !isNaN(d) && d >= 1 && d <= 31);
                  updateRecurrenceConfig(index, {
                    ...config,
                    daysOfMonth: days,
                  });
                }}
              />
            </div>
          </div>
        );

      case "Yearly":
        return (
          <div className="space-y-4">
            <div>
              <Label> Số lần lặp lại mỗi (năm)</Label>
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
                className="w-20"
              />
            </div>
            <div>
              <Label>Các ngày trong năm</Label>
              <div className="space-y-2">
                {(config.monthDays || []).map(
                  (monthDay: any, mdIndex: number) => (
                    <div key={mdIndex} className="flex items-center space-x-2">
                      <Select
                        value={monthDay.month?.toString()}
                        onValueChange={(value) => {
                          const newMonthDays = [...(config.monthDays || [])];
                          newMonthDays[mdIndex] = {
                            ...monthDay,
                            month: parseInt(value),
                          };
                          updateRecurrenceConfig(index, {
                            ...config,
                            monthDays: newMonthDays,
                          });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Ngày"
                        value={monthDay.day || ""}
                        onChange={(e) => {
                          const newMonthDays = [...(config.monthDays || [])];
                          newMonthDays[mdIndex] = {
                            ...monthDay,
                            day: parseInt(e.target.value) || 1,
                          };
                          updateRecurrenceConfig(index, {
                            ...config,
                            monthDays: newMonthDays,
                          });
                        }}
                        className="w-20"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMonthDays = (config.monthDays || []).filter(
                            (_: any, i: number) => i !== mdIndex,
                          );
                          updateRecurrenceConfig(index, {
                            ...config,
                            monthDays: newMonthDays,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMonthDays = [
                      ...(config.monthDays || []),
                      { month: 1, day: 1 },
                    ];
                    updateRecurrenceConfig(index, {
                      ...config,
                      monthDays: newMonthDays,
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm ngày
                </Button>
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
      <div className="bg-blue-100 p-6 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-12 w-12 text-[#1a80a2]" />
        </div>
        <h3 className="text-center text-lg font-medium text-[#1a80a2] mb-2">
          Cấu hình công việc
        </h3>
        <p className="text-center text-gray-600 text-sm">
          Thiết lập các công việc và lịch trình thực hiện
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
            className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm công việc
          </Button>
        </div>

        {taskRequirements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có công việc
            </h3>
            <p className="text-gray-600 mb-4">Thêm công việc đầu tiên</p>
          </div>
        ) : (
          <div className="space-y-6">
            {taskRequirements.map((task, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Công việc {index + 1}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTask(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Task Name */}
                  <div>
                    <Label htmlFor={`task-name-${index}`}>Tên công việc</Label>
                    <Input
                      id={`task-name-${index}`}
                      placeholder="VD: Vệ sinh hàng ngày"
                      value={task.name}
                      onChange={(e) =>
                        updateTask(index, "name", e.target.value)
                      }
                    />
                  </div>

                  {/* Recurrence Type */}
                  <div>
                    <Label htmlFor={`recurrence-type-${index}`}>
                      Loại lặp lại
                    </Label>
                    <Select
                      value={task.recurrenceType}
                      onValueChange={(value) =>
                        handleRecurrenceTypeChange(index, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại lặp lại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Hàng ngày</SelectItem>
                        <SelectItem value="Weekly">Hàng tuần</SelectItem>
                        <SelectItem value="Monthly">Hàng tháng</SelectItem>
                        <SelectItem value="Yearly">Hàng năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recurrence Configuration */}
                  <div>
                    <Label>Cấu hình lặp lại</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
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
