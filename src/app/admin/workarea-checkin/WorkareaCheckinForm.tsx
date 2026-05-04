"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Props = {
  initialData?: any | null;
  workareas: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
};

export default function WorkareaCheckinForm({
  initialData,
  workareas,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    workareaId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        code: initialData.code || "",
        workareaId: initialData.workareaId?.toString() || "",
      });
    } else {
      setForm({
        name: "",
        code: "",
        workareaId: "",
      });
    }

    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.workareaId) err.workareaId = "Workarea là bắt buộc";

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
          placeholder="Tên điểm Check-in"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name}</p>
        )}

        <Input
          placeholder="Code"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
          disabled={!!initialData}
        />

        <select
          className="w-full border rounded p-2"
          value={form.workareaId}
          onChange={(e) =>
            setForm({ ...form, workareaId: e.target.value })
          }
          disabled={!!initialData}
        >
          <option value="">Chọn khu vực làm việc</option>
          {workareas?.map((w) => (
            <option key={w.id} value={w.id.toString()}>
              {w.name}
            </option>
          ))}
        </select>

        {errors.workareaId && (
          <p className="text-red-500 text-xs">{errors.workareaId}</p>
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
