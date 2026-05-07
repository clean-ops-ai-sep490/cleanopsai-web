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

export default function CertificationForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    issuingOrganization: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        issuingOrganization: initialData.issuingOrganization || "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        issuingOrganization: "",
      });
    }
    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên chứng chỉ là bắt buộc";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!form.category.trim()) {
      newErrors.category = "Danh mục là bắt buộc";
    }

    if (!form.issuingOrganization.trim()) {
      newErrors.issuingOrganization = "Tổ chức cấp là bắt buộc";
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
      setErrors({ submit: "Lưu chứng chỉ thất bại. Vui lòng thử lại." });
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
            Lưu chứng chỉ thành công
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Tên chứng chỉ <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: ISO 9001:2015"
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

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: Management, Safety"
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

        {/* Issuing Organization */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Tổ chức cấp <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="VD: Tổ chức ISO Việt Nam"
            value={form.issuingOrganization}
            onChange={(e) => {
              setForm({
                ...form,
                issuingOrganization: e.target.value,
              });
              if (errors.issuingOrganization)
                setErrors({ ...errors, issuingOrganization: "" });
            }}
            className={`transition-all ${
              errors.issuingOrganization
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {errors.issuingOrganization && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.issuingOrganization}
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
