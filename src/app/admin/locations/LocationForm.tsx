"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { LocationFormData } from "@/types/contract";
import { useAllClients } from "@/hooks/useClients";

type Props = {
  initialData?: any | null;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
};

export default function LocationForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<LocationFormData>({
    name: "",
    address: "",
    street: "",
    commune: "",
    province: "",
    latitude: null,
    longitude: null,
    clientId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const { data: clientsData } = useAllClients();

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        street: initialData.street || "",
        commune: initialData.commune || "",
        province: initialData.province || "",
        latitude: initialData.latitude ?? null,
        longitude: initialData.longitude ?? null,
        clientId: initialData.clientId || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.address.trim()) err.address = "Địa chỉ là bắt buộc";
    if (!form.clientId.trim()) err.clientId = "Client là bắt buộc";

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
          placeholder="Tên vị trí"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

        <Input
          placeholder="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <Input
          placeholder="Đường"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />

        <Input
          placeholder="Phường/Xã"
          value={form.commune}
          onChange={(e) => setForm({ ...form, commune: e.target.value })}
        />

        <Input
          placeholder="Tỉnh (TP)"
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
        />

        <div className="flex gap-2">
          <Input
  type="number"
  placeholder="Latitude"
  value={form.latitude ?? ""}
  onChange={(e) =>
    setForm({
      ...form,
      latitude: e.target.value === "" ? null : Number(e.target.value),
    })
  }
/>
          <Input
    type="number"
    placeholder="Longitude"
    value={form.longitude ?? ""}
    onChange={(e) =>
      setForm({
        ...form,
        longitude: e.target.value === "" ? null : Number(e.target.value),
      })
    }
  />
        </div>

        <select
  value={form.clientId}
  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
  className="w-full border rounded-md px-3 py-2 text-sm"
>
  <option value="">Chọn client</option>

  {clientsData
  ?.sort((a: any, b: any) => a.name.localeCompare(b.name))
  .map((c: any) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

{errors.clientId && (
  <p className="text-red-500 text-xs">{errors.clientId}</p>
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
