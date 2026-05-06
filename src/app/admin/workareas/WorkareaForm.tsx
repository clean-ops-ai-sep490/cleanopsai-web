import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { WorkAreaFormData } from "@/types/contract";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getZonesPaginatedNew, getZoneById } from "@/lib/zone-api";

type Props = {
  initialData?: any | null;
  onSubmit: (data: WorkAreaFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WorkAreaForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<WorkAreaFormData>({
    name: "",
    zoneId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        zoneId: initialData.zoneId || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};

    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.zoneId) err.zoneId = "Vui lòng chọn zone";

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
          Thành công
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
          <Label>Tên work area *</Label>
          <Input
            placeholder="Tên work area"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label>Khu vực (Zone) *</Label>
          <SearchableSelect
            value={form.zoneId}
            onValueChange={(value) => setForm({ ...form, zoneId: value })}
            placeholder="Chọn khu vực"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["zones", "infinite"]}
            queryFn={(page, pageSize, search) =>
              getZonesPaginatedNew(page, pageSize, { search }).then(res => ({
                ...res,
                content: res.content.map(item => ({
                  ...item,
                  id: String(item.id || ""),
                  name: item.name || ""
                }))
              }))
            }
            getItemById={(id) => 
              getZoneById(id).then(item => ({
                ...item,
                id: String(item.id || ""),
                name: item.name || ""
              }))
            }
          />
          {errors.zoneId && (
            <p className="text-red-500 text-xs">{errors.zoneId}</p>
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
