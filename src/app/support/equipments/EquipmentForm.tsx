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

export default function EquipmentForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "",
        description: initialData.description || "",
      });
    } else {
      setForm({
        name: "",
        type: "",
        description: "",
      });
    }
    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên thiết bị là bắt buộc";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!form.type.trim()) {
      newErrors.type = "Loại thiết bị là bắt buộc";
    }

    if (form.description.trim().length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setSuccess(false);

      await onSubmit(form);
      onCancel();
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Lưu thiết bị thất bại. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Success */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Lưu thiết bị thành công
          </span>
        </div>
      )}

      {/* Error */}
      {errors.submit && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            {errors.submit}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Tên thiết bị <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: Máy khoan công nghiệp"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Loại thiết bị <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: Máy móc, Dụng cụ"
            value={form.type}
            onChange={(e) => {
              setForm({ ...form, type: e.target.value });
              if (errors.type) setErrors({ ...errors, type: "" });
            }}
            className={errors.type ? "border-red-500" : ""}
          />
          {errors.type && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.type}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-semibold">Mô tả</label>
            <span className="text-xs text-muted-foreground">
              {form.description.length}/500
            </span>
          </div>
          <textarea
            placeholder="Nhập mô tả..."
            value={form.description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setForm({ ...form, description: e.target.value });
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }
            }}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Lưu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
