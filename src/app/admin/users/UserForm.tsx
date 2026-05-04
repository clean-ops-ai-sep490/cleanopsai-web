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

export default function UserForm({ initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const ROLES = ["Worker", "Supervisor", "Manager", "Admin"] as const;

  useEffect(() => {
    if (initialData) {
      setForm({
        email: initialData.email || "",
        fullName: initialData.fullName || "",
        password: "",
        role: initialData.role || "",
      });
    } else {
      setForm({
        email: "",
        fullName: "",
        password: "",
        role: "",
      });
    }

    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.email.trim()) err.email = "Email là bắt buộc";
    if (!form.fullName.trim()) err.fullName = "Họ tên là bắt buộc";

    if (!initialData && !form.password.trim()) {
      err.password = "Password là bắt buộc khi tạo mới";
    }

    if (!form.role.trim()) err.role = "Role là bắt buộc";

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
      }, 1000);
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
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

        <Input
          placeholder="Họ tên"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs">{errors.fullName}</p>
        )}

        {!initialData && (
          <>
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </>
        )}

        <select
  value={form.role}
  onChange={(e) => setForm({ ...form, role: e.target.value })}
  className="w-full border rounded-md px-3 py-2 text-sm"
>
  <option value="">Chọn chức vụ</option>

  {ROLES.map((role) => (
    <option key={role} value={role}>
      {role}
    </option>
  ))}
</select>

{errors.role && (
  <p className="text-red-500 text-xs">{errors.role}</p>
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