"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useWorkArea } from "@/hooks/useWorkarea"; // ← đổi sang hook này

type WorkAreaDetailFormData = {
  name: string;
  area: number | string;
  totalArea: number | string;
  workAreaId: string;
  workAreaName: string;
};

type Props = {
  initialData?: any | null;
  onSubmit: (data: WorkAreaDetailFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WorkAreaDetailForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<WorkAreaDetailFormData>({
    name: "",
    area: "",
    totalArea: "",
    workAreaId: "",
    workAreaName: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // ← Dùng useWorkArea thay vì useAllWorkAreas
  const { items: workAreaList, fetchAllWorkAreas } = useWorkArea();

  // Fetch khi mount
  useEffect(() => {
    fetchAllWorkAreas();
  }, [fetchAllWorkAreas]);

  // Set form khi có initialData VÀ workAreaList đã load xong
  useEffect(() => {
    if (initialData && workAreaList.length > 0) {
      setForm({
        name: initialData.name || "",
        area: initialData.area ?? "",
        totalArea: initialData.totalArea ?? "",
        workAreaId: initialData.workAreaId || "",
        workAreaName: initialData.workAreaName || "",
      });
    }
  }, [initialData, workAreaList]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (form.area === "" || isNaN(Number(form.area))) err.area = "Diện tích không hợp lệ";
    if (form.totalArea === "" || isNaN(Number(form.totalArea))) err.totalArea = "Tổng diện tích không hợp lệ";
    if (!form.workAreaId) err.workAreaId = "Vui lòng chọn khu vực làm việc";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await onSubmit({
        ...form,
        area: Number(form.area),
        totalArea: Number(form.totalArea),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel();
      }, 800);
    } catch {
      setErrors({ submit: "Lưu thất bại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {success && (
        <div className="text-green-600 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Thành công
        </div>
      )}
      {errors.submit && (
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Tên chi tiết"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <Input
            placeholder="Diện tích"
            type="number"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
        </div>

        <div>
          <Input
            placeholder="Tổng diện tích"
            type="number"
            value={form.totalArea}
            onChange={(e) => setForm({ ...form, totalArea: e.target.value })}
          />
          {errors.totalArea && <p className="text-red-500 text-xs mt-1">{errors.totalArea}</p>}
        </div>

        <div>
          <select
            value={form.workAreaId}
            onChange={(e) => setForm({ ...form, workAreaId: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="">Chọn khu vực làm việc</option>
            {workAreaList.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {errors.workAreaId && (
            <p className="text-red-500 text-xs mt-1">{errors.workAreaId}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang lưu...</>
            ) : "Lưu"}
          </Button>
        </div>
      </form>
    </div>
  );
}