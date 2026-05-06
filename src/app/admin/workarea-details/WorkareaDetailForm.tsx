import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getWorkAreasPaginatedNew, getWorkAreaById } from "@/lib/work-area-api";

type WorkAreaDetailFormData = {
  name: string;
  area: number | string;
  totalArea: number | string;
  workAreaId: string;
  workAreaName: string;
};

type Props = {
  initialData?: any | null;
  onSubmit: (data: WorkAreaDetailFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WorkAreaDetailForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<WorkAreaDetailFormData>({
    name: "",
    area: 0,
    totalArea: 0,
    workAreaId: "",
    workAreaName: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        area: initialData.area ?? 0,
        totalArea: initialData.totalArea ?? 0,
        workAreaId: initialData.workAreaId || "",
        workAreaName: initialData.workAreaName || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Tên là bắt buộc";
    if (!form.workAreaId) err.workAreaId = "Vui lòng chọn khu vực làm việc";
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
        area: 0,
        totalArea: 0,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel();
      }, 800);
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
          <CheckCircle className="w-4 h-4" /> Thành công
        </div>
      )}
      {errors.submit && (
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label>Tên chi tiết *</Label>
          <Input
            placeholder="Tên chi tiết"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <Label>Khu vực làm việc *</Label>
          <SearchableSelect
            value={form.workAreaId}
            onValueChange={(value) => setForm({ ...form, workAreaId: value })}
            placeholder="Chọn khu vực làm việc"
            useInfiniteLoading={true}
            pageSize={10}
            queryKey={["work-areas", "infinite"]}
            queryFn={(page, pageSize, search) =>
              getWorkAreasPaginatedNew(page, pageSize, { search }).then(res => ({
                ...res,
                content: res.content.map(item => ({
                  ...item,
                  id: item.id || "",
                  name: item.name || ""
                }))
              }))
            }
            getItemById={(id) => 
              getWorkAreaById(id).then(item => ({
                ...item,
                id: item.id || "",
                name: item.name || ""
              }))
            }
          />
          {errors.workAreaId && (
            <p className="text-red-500 text-xs mt-1">{errors.workAreaId}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang lưu...</>
            ) : "Lưu"}
          </Button>
        </div>
      </form>
    </div>
  );
}