"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  initialData?: any | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
};

export default function StepForm({ initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    actionKey: "",
    name: "",
    description: "",
    configSchema: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        actionKey: initialData.actionKey || "",
        name: initialData.name || "",
        description: initialData.description || "",
        configSchema:
          typeof initialData.configSchema === "string"
            ? initialData.configSchema
            : JSON.stringify(initialData.configSchema, null, 2),
      });
    } else {
      setForm({
        actionKey: "",
        name: "",
        description: "",
        configSchema: "",
      });
    }

    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.actionKey.trim()) err.actionKey = "ActionKey là bắt buộc";
    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.configSchema.trim())
      err.configSchema = "ConfigSchema là bắt buộc";

    try {
      JSON.parse(form.configSchema);
    } catch {
      err.configSchema = "ConfigSchema phải là JSON hợp lệ";
    }

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
        configSchema: JSON.stringify(JSON.parse(form.configSchema)),
      });
      onCancel();
    } catch {
      setErrors({ submit: "Lưu thất bại, vui lòng thử lại" });
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
          placeholder="ActionKey (vd: photo-capture)"
          value={form.actionKey}
          onChange={(e) =>
            setForm({ ...form, actionKey: e.target.value })
          }
        />
        {errors.actionKey && (
          <p className="text-red-500 text-xs">{errors.actionKey}</p>
        )}

        <Input
          placeholder="Tên bước"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <Input
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <textarea
          className="w-full border rounded p-2 font-mono text-xs h-40"
          placeholder="Cấu hình JSON (configSchema)"
          value={form.configSchema}
          onChange={(e) =>
            setForm({ ...form, configSchema: e.target.value })
          }
        />

        {errors.configSchema && (
          <p className="text-red-500 text-xs">{errors.configSchema}</p>
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
