import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { LocationFormData } from "@/types/contract";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getClientsPaginatedNew, getClientById } from "@/lib/client-api";

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
        <div className="space-y-1">
          <Label>Tên vị trí *</Label>
          <Input
            placeholder="Tên vị trí"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label>Địa chỉ *</Label>
          <Input
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Đường</Label>
            <Input
              placeholder="Đường"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Phường/Xã</Label>
            <Input
              placeholder="Phường/Xã"
              value={form.commune}
              onChange={(e) => setForm({ ...form, commune: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Tỉnh (TP)</Label>
          <Input
            placeholder="Tỉnh (TP)"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <div className="space-y-1 flex-1">
            <Label>Latitude</Label>
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
          </div>
          <div className="space-y-1 flex-1">
            <Label>Longitude</Label>
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
        </div>

        <div className="space-y-1">
          <Label>Khách hàng *</Label>
          <SearchableSelect
            value={form.clientId}
            onValueChange={(value) => setForm({ ...form, clientId: value })}
            placeholder="Chọn khách hàng"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["clients", "infinite"]}
            queryFn={(page, pageSize, search) => 
              getClientsPaginatedNew(page, pageSize, { search }).then(res => ({
                ...res,
                content: res.content.map(item => ({
                  ...item,
                  id: String(item.id),
                  name: item.name || ""
                }))
              }))
            }
            getItemById={(id) => 
              getClientById(id).then(item => ({
                ...item,
                id: String(item.id),
                name: item.name || ""
              }))
            }
          />
          {errors.clientId && (
            <p className="text-red-500 text-xs">{errors.clientId}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
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

// Add Label import if missing
import { Label } from "@/components/ui/label";
