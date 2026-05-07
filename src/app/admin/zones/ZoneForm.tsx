import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { ZoneFormData } from "@/types/contract";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getLocationsPaginatedNew, getLocationById } from "@/lib/location-api";

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
        <div className="space-y-1">
          <Label>Tên khu vực *</Label>
          <Input
            placeholder="Tên khu vực"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label>Mô tả</Label>
          <Input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label>Vị trí (Location) *</Label>
          <SearchableSelect
            value={form.locationId}
            onValueChange={(value) => setForm({ ...form, locationId: value })}
            placeholder="Chọn vị trí"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["locations", "infinite"]}
            queryFn={(page, pageSize, search) =>
              getLocationsPaginatedNew(page, pageSize, { search }).then(res => ({
                ...res,
                content: res.content.map(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }))
            }
            getItemById={(id) => 
              getLocationById(id).then(item => ({
                ...item,
                id: item.id || "",
                name: item.name || ""
              }))
            }
          />
          {errors.locationId && (
            <p className="text-red-500 text-xs">{errors.locationId}</p>
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
