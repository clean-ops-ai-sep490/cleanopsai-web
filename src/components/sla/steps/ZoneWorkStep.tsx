"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MapPin,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
} from "lucide-react";
import type { Zone, WorkArea, WorkAreaTask } from "@/types/sla";

interface ZoneWorkStepProps {
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
  workAreas: WorkArea[];
  onWorkAreasChange: (workAreas: WorkArea[]) => void;
}

export function ZoneWorkStep({
  zones,
  onZonesChange,
  workAreas,
  onWorkAreasChange,
}: ZoneWorkStepProps) {
  const [activeTab, setActiveTab] = useState<"outdoor" | "indoor">("outdoor");
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showWorkAreaForm, setShowWorkAreaForm] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", description: "" });
  const [newWorkArea, setNewWorkArea] = useState({
    name: "",
    zoneId: "",
    area: 0,
    description: "",
    tasks: [] as WorkAreaTask[],
  });
  const [expandedWorkAreas, setExpandedWorkAreas] = useState<Set<string>>(
    new Set(),
  );

  // Default tasks for different service types
  const defaultTasks: WorkAreaTask[] = [
    {
      id: "1",
      name: "Quét, nhặt rác và lá úa trên vỉa hè, lòng đường",
      frequency: { daily: false, weekly: false, monthly: false, yearly: false },
    },
    {
      id: "2",
      name: "Thường xuyên kiểm tra và thu gom rác phát sinh",
      frequency: { daily: false, weekly: false, monthly: false, yearly: false },
    },
    {
      id: "3",
      name: "Tẩy vết dầu xe và các vết bẩn",
      frequency: { daily: false, weekly: false, monthly: false, yearly: false },
    },
    {
      id: "4",
      name: "Vệ sinh các thùng rác",
      frequency: { daily: false, weekly: false, monthly: false, yearly: false },
    },
  ];

  const handleAddZone = () => {
    if (newZone.name.trim()) {
      const zone: Zone = {
        id: Date.now().toString(),
        name: newZone.name,
        description: newZone.description,
        createdAt: new Date().toISOString().split("T")[0],
      };
      onZonesChange([...zones, zone]);
      setNewZone({ name: "", description: "" });
      setShowZoneForm(false);
    }
  };

  const handleAddWorkArea = () => {
    if (newWorkArea.name.trim() && newWorkArea.zoneId && newWorkArea.area > 0) {
      const workArea: WorkArea = {
        id: Date.now().toString(),
        name: newWorkArea.name,
        zoneId: newWorkArea.zoneId,
        area: newWorkArea.area,
        description: newWorkArea.description,
        tasks: newWorkArea.tasks,
        createdAt: new Date().toISOString().split("T")[0],
      };
      onWorkAreasChange([...workAreas, workArea]);
      setNewWorkArea({
        name: "",
        zoneId: "",
        area: 0,
        description: "",
        tasks: [],
      });
      setShowWorkAreaForm(false);
    }
  };

  const handleAddTaskToNewWorkArea = () => {
    const newTask: WorkAreaTask = {
      id: Date.now().toString(),
      name: "",
      frequency: { daily: false, weekly: false, monthly: false, yearly: false },
    };
    setNewWorkArea({
      ...newWorkArea,
      tasks: [...newWorkArea.tasks, newTask],
    });
  };

  const handleUpdateTaskInNewWorkArea = (
    taskId: string,
    field: string,
    value: any,
  ) => {
    setNewWorkArea({
      ...newWorkArea,
      tasks: newWorkArea.tasks.map((task) => {
        if (task.id === taskId) {
          if (field === "name") {
            return { ...task, name: value };
          } else {
            return {
              ...task,
              frequency: { ...task.frequency, [field]: value },
            };
          }
        }
        return task;
      }),
    });
  };

  const handleUpdateWorkAreaTask = (
    workAreaId: string,
    taskId: string,
    field: string,
    value: any,
  ) => {
    const updatedWorkAreas = workAreas.map((workArea) => {
      if (workArea.id === workAreaId) {
        return {
          ...workArea,
          tasks: workArea.tasks.map((task) => {
            if (task.id === taskId) {
              if (field === "name") {
                return { ...task, name: value };
              } else {
                return {
                  ...task,
                  frequency: { ...task.frequency, [field]: value },
                };
              }
            }
            return task;
          }),
        };
      }
      return workArea;
    });
    onWorkAreasChange(updatedWorkAreas);
  };

  const toggleWorkAreaExpansion = (workAreaId: string) => {
    const newExpanded = new Set(expandedWorkAreas);
    if (newExpanded.has(workAreaId)) {
      newExpanded.delete(workAreaId);
    } else {
      newExpanded.add(workAreaId);
    }
    setExpandedWorkAreas(newExpanded);
  };

  const getWorkAreasByZone = (zoneId: string) => {
    return workAreas.filter((area) => area.zoneId === zoneId);
  };

  const getTotalAreaByZone = (zoneId: string) => {
    return getWorkAreasByZone(zoneId).reduce(
      (total, area) => total + area.area,
      0,
    );
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h2 className="text-xl font-semibold text-black mb-6">
          Phạm vi thực hiện
        </h2>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "outdoor" ? "default" : "outline"}
            onClick={() => setActiveTab("outdoor")}
            className={
              activeTab === "outdoor"
                ? "bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                : ""
            }
          >
            Ngoài Cảnh
          </Button>
          <Button variant="outline" onClick={() => setShowZoneForm(true)}>
            + Thêm khu vực
          </Button>
        </div>

        {/* Work Areas Table */}
        <div className="space-y-6">
          {zones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có zone nào
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Thêm zone đầu tiên để bắt đầu
              </p>
              <Button
                onClick={() => setShowZoneForm(true)}
                className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Zone
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => {
                const zoneWorkAreas = getWorkAreasByZone(zone.id);
                const totalArea = getTotalAreaByZone(zone.id);

                return (
                  <Card key={zone.id} className="border-l-4 border-l-[#1a80a2]">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-black text-lg">
                            {zone.name}
                          </h3>
                          {zone.description && (
                            <p className="text-sm text-gray-600">
                              {zone.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {zoneWorkAreas.length} khu vực làm việc • Tổng diện
                            tích: {totalArea}m²
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setNewWorkArea({
                              ...newWorkArea,
                              zoneId: zone.id,
                              tasks: [...defaultTasks],
                            });
                            setShowWorkAreaForm(true);
                          }}
                          className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                        >
                          + Thêm khu vực làm việc
                        </Button>
                      </div>

                      {/* Work Areas List */}
                      {zoneWorkAreas.length > 0 && (
                        <div className="space-y-2">
                          {zoneWorkAreas.map((workArea) => (
                            <div
                              key={workArea.id}
                              className="border rounded-lg p-3 bg-gray-50"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                  toggleWorkAreaExpansion(workArea.id)
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  {expandedWorkAreas.has(workArea.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <div>
                                    <p className="font-medium text-black">
                                      {workArea.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Diện tích: {workArea.area}m² •{" "}
                                      {workArea.tasks.length} công việc
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Tasks Table */}
                              {expandedWorkAreas.has(workArea.id) && (
                                <div className="mt-4 overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-2 font-medium text-gray-700">
                                          STT
                                        </th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-700">
                                          Công việc
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-700">
                                          Ngày
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-700">
                                          Tuần
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-700">
                                          Tháng
                                        </th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-700">
                                          Năm
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {workArea.tasks.map((task, index) => (
                                        <tr
                                          key={task.id}
                                          className="border-b hover:bg-white"
                                        >
                                          <td className="py-2 px-2 text-center">
                                            {index + 1}
                                          </td>
                                          <td className="py-2 px-2">
                                            <Input
                                              value={task.name}
                                              onChange={(e) =>
                                                handleUpdateWorkAreaTask(
                                                  workArea.id,
                                                  task.id,
                                                  "name",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Nhập tên công việc"
                                              className="border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
                                            />
                                          </td>
                                          <td className="py-2 px-2 text-center">
                                            <Checkbox
                                              checked={task.frequency.daily}
                                              onCheckedChange={(checked) =>
                                                handleUpdateWorkAreaTask(
                                                  workArea.id,
                                                  task.id,
                                                  "daily",
                                                  checked,
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="py-2 px-2 text-center">
                                            <Checkbox
                                              checked={task.frequency.weekly}
                                              onCheckedChange={(checked) =>
                                                handleUpdateWorkAreaTask(
                                                  workArea.id,
                                                  task.id,
                                                  "weekly",
                                                  checked,
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="py-2 px-2 text-center">
                                            <Checkbox
                                              checked={task.frequency.monthly}
                                              onCheckedChange={(checked) =>
                                                handleUpdateWorkAreaTask(
                                                  workArea.id,
                                                  task.id,
                                                  "monthly",
                                                  checked,
                                                )
                                              }
                                            />
                                          </td>
                                          <td className="py-2 px-2 text-center">
                                            <Checkbox
                                              checked={task.frequency.yearly}
                                              onCheckedChange={(checked) =>
                                                handleUpdateWorkAreaTask(
                                                  workArea.id,
                                                  task.id,
                                                  "yearly",
                                                  checked,
                                                )
                                              }
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {zones.length > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowZoneForm(true)}
                className="text-[#1a80a2] hover:text-[#1a80a2]/80 text-sm font-medium"
              >
                + Thêm zone
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone Form Popup */}
      {showZoneForm && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-5 flex items-center justify-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">
                Thêm Zone Mới
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowZoneForm(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Tên zone</Label>
                <Input
                  id="zoneName"
                  placeholder="VD: Khu vực ngoài cảnh, Khu vực trong nhà..."
                  value={newZone.name}
                  onChange={(e) =>
                    setNewZone({ ...newZone, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneDescription">Mô tả</Label>
                <Input
                  id="zoneDescription"
                  placeholder="Mô tả chi tiết về zone"
                  value={newZone.description}
                  onChange={(e) =>
                    setNewZone({ ...newZone, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowZoneForm(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddZone}
                  className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                >
                  Thêm Zone
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Area Form Popup */}
      {showWorkAreaForm && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-5 flex items-center justify-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">
                Thêm Khu Vực Làm Việc & Công Việc
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkAreaForm(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workAreaName">Tên khu vực làm việc</Label>
                  <Input
                    id="workAreaName"
                    placeholder="VD: Sảnh tầng 1, Phòng họp A..."
                    value={newWorkArea.name}
                    onChange={(e) =>
                      setNewWorkArea({ ...newWorkArea, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workAreaSize">Diện tích (m²)</Label>
                  <Input
                    id="workAreaSize"
                    type="number"
                    placeholder="Nhập diện tích"
                    value={newWorkArea.area || ""}
                    onChange={(e) =>
                      setNewWorkArea({
                        ...newWorkArea,
                        area: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workAreaDescription">Mô tả</Label>
                <Input
                  id="workAreaDescription"
                  placeholder="Mô tả chi tiết khu vực"
                  value={newWorkArea.description}
                  onChange={(e) =>
                    setNewWorkArea({
                      ...newWorkArea,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Tasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-black">
                    Danh sách công việc
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTaskToNewWorkArea}
                  >
                    + Thêm công việc
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">
                          STT
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 border-b">
                          Tên công việc
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-b">
                          Ngày
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-b">
                          Tuần
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-b">
                          Tháng
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-b">
                          Năm
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700 border-b">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {newWorkArea.tasks.map((task, index) => (
                        <tr key={task.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-center">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Input
                              value={task.name}
                              onChange={(e) =>
                                handleUpdateTaskInNewWorkArea(
                                  task.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="Nhập tên công việc"
                              className="border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Checkbox
                              checked={task.frequency.daily}
                              onCheckedChange={(checked) =>
                                handleUpdateTaskInNewWorkArea(
                                  task.id,
                                  "daily",
                                  checked,
                                )
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Checkbox
                              checked={task.frequency.weekly}
                              onCheckedChange={(checked) =>
                                handleUpdateTaskInNewWorkArea(
                                  task.id,
                                  "weekly",
                                  checked,
                                )
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Checkbox
                              checked={task.frequency.monthly}
                              onCheckedChange={(checked) =>
                                handleUpdateTaskInNewWorkArea(
                                  task.id,
                                  "monthly",
                                  checked,
                                )
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Checkbox
                              checked={task.frequency.yearly}
                              onCheckedChange={(checked) =>
                                handleUpdateTaskInNewWorkArea(
                                  task.id,
                                  "yearly",
                                  checked,
                                )
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewWorkArea({
                                  ...newWorkArea,
                                  tasks: newWorkArea.tasks.filter(
                                    (t) => t.id !== task.id,
                                  ),
                                });
                              }}
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowWorkAreaForm(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddWorkArea}
                  className="bg-[#1a80a2] hover:bg-[#1a80a2]/90"
                >
                  Thêm Khu Vực
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {zones.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">Tóm tắt phạm vi:</h3>
            <div className="space-y-1">
              <p className="text-blue-800">
                <strong>{zones.length}</strong> zone được thiết lập
              </p>
              <p className="text-blue-800">
                <strong>{workAreas.length}</strong> khu vực làm việc
              </p>
              <p className="text-blue-800">
                Tổng diện tích:{" "}
                <strong>
                  {workAreas.reduce((total, area) => total + area.area, 0)}m²
                </strong>
              </p>
              <p className="text-blue-800">
                Tổng công việc:{" "}
                <strong>
                  {workAreas.reduce(
                    (total, area) => total + area.tasks.length,
                    0,
                  )}
                </strong>{" "}
                task
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
