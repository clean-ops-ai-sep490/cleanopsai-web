import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSLAById, updateSLA } from "@/lib/sla-api";
import type { SLA } from "@/types/sla";

export function useSLAEdit(id: string) {
  const router = useRouter();
  const [sla, setSLA] = useState<SLA | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      loadSLA(id);
    }
  }, [id]);

  const loadSLA = async (slaId: string) => {
    try {
      setLoading(true);
      const data = await getSLAById(slaId);
      setSLA(data);
      setFormData({
        name: data.name,
        description: data.description || "",
      });
    } catch (error) {
      console.error("Failed to load SLA:", error);
      toast.error("Không thể tải thông tin SLA");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sla) return;

    try {
      setSaving(true);
      await updateSLA(sla.id, formData);
      toast.success("Cập nhật SLA thành công!");
      router.push(`/dashboard/sla-trigger/${sla.id}`);
    } catch (error) {
      console.error("Failed to update SLA:", error);
      toast.error("Không thể cập nhật SLA");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    sla,
    loading,
    saving,
    formData,
    handleSubmit,
    handleInputChange,
  };
}
