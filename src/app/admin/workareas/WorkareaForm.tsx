"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { WorkAreaFormData } from "@/types/contract";
import { useAllZones } from "@/hooks/useZones";

type Props = {
  initialData?: any | null;
  onSubmit: (data: WorkAreaFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WorkAreaForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<WorkAreaFormData>({
    name: "",
    zoneId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { data: zones } = useAllZones();

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        zoneId: initialData.zoneId || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.zoneId) err.zoneId = "Vui lòng chọn zone";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(form);

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
          <CheckCircle className="w-4 h-4" />
          Thành công
        </div>
      )}

      {errors.submit && (
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Tên work area"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

        <select
          value={form.zoneId}
          onChange={(e) =>
            setForm({ ...form, zoneId: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Chọn khu vực</option>
          {zones?.map((z: any) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>

        {errors.zoneId && (
          <p className="text-red-500 text-xs">{errors.zoneId}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}