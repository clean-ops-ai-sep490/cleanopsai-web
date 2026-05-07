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

export default function SkillForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        description: initialData.description || "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        description: "",
      });
    }

    setErrors({});
    setSuccess(false);
  }, [initialData]);

  // ================= VALIDATION =================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên kỹ năng là bắt buộc";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên kỹ năng phải có ít nhất 2 ký tự";
    }

    if (!form.category.trim()) {
      newErrors.category = "Danh mục là bắt buộc";
    }

    if (form.description.length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setSuccess(false);

      await onSubmit(form);
      onCancel();
    } catch (err) {
      setErrors({
        submit: "Lưu kỹ năng thất bại. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="w-full space-y-6">

      {/* SUCCESS */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Lưu kỹ năng thành công
          </span>
        </div>
      )}

      {/* ERROR SUBMIT */}
      {errors.submit && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            {errors.submit}
          </span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* NAME */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Tên kỹ năng <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="VD: Giao tiếp khách hàng"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={`transition-all ${
              errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />

          {errors.name && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Danh mục <span className="text-red-500">*</span>
          </label>

          <Input
            placeholder="VD: SoftSkill / HardSkill"
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              if (errors.category) setErrors({ ...errors, category: "" });
            }}
            className={`transition-all ${
              errors.category ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />

          {errors.category && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.category}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Mô tả
          </label>

          <Input
            placeholder="VD: Kỹ năng giao tiếp với khách hàng"
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              if (errors.description)
                setErrors({ ...errors, description: "" });
            }}
            className={`transition-all ${
              errors.description ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />

          {errors.description && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
