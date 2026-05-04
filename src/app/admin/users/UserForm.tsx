"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  initialData?: any | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
};

const ROLES = ["Worker", "Supervisor", "Manager", "Admin"] as const;

export default function UserForm({ initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({ email: "", fullName: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) setForm({ email: initialData.email || "", fullName: initialData.fullName || "", password: "", role: initialData.role || "" });
    else setForm({ email: "", fullName: "", password: "", role: "" });
    setErrors({});
    setSuccess(false);
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.email.trim()) err.email = "Email là bắt buộc";
    if (!form.fullName.trim()) err.fullName = "Họ tên là bắt buộc";
    if (!initialData && !form.password.trim()) err.password = "Mật khẩu là bắt buộc khi tạo mới";
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
      onCancel();
    } catch {
      setErrors({ submit: "Lưu thất bại" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success ? <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle className="h-4 w-4" />Lưu thành công</div> : null}
      {errors.submit ? <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"><AlertCircle className="h-4 w-4" />{errors.submit}</div> : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email ? <p className="text-xs text-rose-600">{errors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Họ tên</label>
        <Input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        {errors.fullName ? <p className="text-xs text-rose-600">{errors.fullName}</p> : null}
      </div>

      {!initialData ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <Input type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password ? <p className="text-xs text-rose-600">{errors.password}</p> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Role</label>
        <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
          <SelectTrigger><SelectValue placeholder="Chọn role" /></SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.role ? <p className="text-xs text-rose-600">{errors.role}</p> : null}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</> : "Lưu"}</Button>
      </div>
    </form>
  );
}

