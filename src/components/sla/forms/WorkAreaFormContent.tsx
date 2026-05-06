import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormActions } from "@/components/ui/form-actions";
import { Trash2 } from "lucide-react";
import type { WorkAreaTask } from "@/types/sla";
import {
  validateWorkArea,
  type WorkAreaFormData,
} from "@/lib/validators/work-area-validator";
import { toastUtils } from "@/lib/utils/toast-utils";

interface WorkAreaFormContentProps {
  newWorkArea: WorkAreaFormData;
  setNewWorkArea: (workArea: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddTask: () => void;
  onUpdateTask: (taskId: string, field: string, value: any) => void;
}

export function WorkAreaFormContent({
  newWorkArea,
  setNewWorkArea,
  onSave,
  onCancel,
  onAddTask,
  onUpdateTask,
}: WorkAreaFormContentProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateWorkArea(newWorkArea);
    if (errors.length > 0) {
      toastUtils.error(errors[0].message);
      return;
    }

    onSave();
  };

  const handleReset = () => {
    setNewWorkArea({
      name: "",
      zoneId: newWorkArea.zoneId, // Keep zone ID
      description: "",
      tasks: [],
    });
  };

  const handleRemoveTask = (taskId: string) => {
    setNewWorkArea({
      ...newWorkArea,
      tasks: newWorkArea.tasks.filter((t) => t.id !== taskId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workAreaName">Tên khu vực làm việc *</Label>
          <Input
            id="workAreaName"
            placeholder="VD: Sảnh tầng 1, Phòng họp A..."
            value={newWorkArea.name}
            onChange={(e) =>
              setNewWorkArea({ ...newWorkArea, name: e.target.value })
            }
            required
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
          <h4 className="font-medium text-black">Danh sách công việc</h4>
          <Button type="button" variant="outline" size="sm" onClick={onAddTask}>
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
                        onUpdateTask(task.id, "name", e.target.value)
                      }
                      placeholder="Nhập tên công việc"
                      className="border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Checkbox
                      checked={task.frequency.daily}
                      onCheckedChange={(checked) =>
                        onUpdateTask(task.id, "daily", checked)
                      }
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Checkbox
                      checked={task.frequency.weekly}
                      onCheckedChange={(checked) =>
                        onUpdateTask(task.id, "weekly", checked)
                      }
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Checkbox
                      checked={task.frequency.monthly}
                      onCheckedChange={(checked) =>
                        onUpdateTask(task.id, "monthly", checked)
                      }
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Checkbox
                      checked={task.frequency.yearly}
                      onCheckedChange={(checked) =>
                        onUpdateTask(task.id, "yearly", checked)
                      }
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(task.id)}
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

      <FormActions
        onReset={handleReset}
        onCancel={onCancel}
        submitLabel="Thêm Khu Vực"
        cancelLabel="Hủy"
        isLoading={false}
      />
    </form>
  );
}
