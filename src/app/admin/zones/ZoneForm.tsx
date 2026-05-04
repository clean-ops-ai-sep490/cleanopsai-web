"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { ZoneFormData } from "@/types/contract";
import { useAllLocations } from "@/hooks/useLocations";

type Props = {
  initialData?: any | null;
  onSubmit: (data: ZoneFormData) => Promise<void>;
  onCancel: () => void;
};

export default function ZoneForm({ initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ZoneFormData>({
    name: "",
    description: "",
    locationId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const { data: locations } = useAllLocations();

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        locationId: initialData.locationId || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.locationId) err.locationId = "Vui lòng chọn vị trí";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(form);
      onCancel();
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
          Lưu thành công
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
          placeholder="Tên khu vực"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

        <Input
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          value={form.locationId}
          onChange={(e) =>
            setForm({ ...form, locationId: e.target.value })
          }
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Chọn vị trí</option>
          {locations?.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {errors.locationId && (
          <p className="text-red-500 text-xs">{errors.locationId}</p>
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
