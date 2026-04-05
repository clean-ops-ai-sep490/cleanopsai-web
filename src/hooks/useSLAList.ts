import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSLAs, deleteSLA } from "@/lib/sla-api";
import type { SLA } from "@/types/sla";

export function useSLAList() {
  const [slas, setSLAs] = useState<SLA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSLAs();
  }, []);

  const loadSLAs = async () => {
    try {
      setLoading(true);
      const data = await getSLAs();
      console.log("SLA API Response:", data);
      setSLAs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load SLAs:", error);
      toast.error("Không thể tải danh sách SLA");
      setSLAs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSLA = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa SLA này?")) return;

    try {
      await deleteSLA(id);
      setSLAs(slas.filter((sla) => sla.id !== id));
      toast.success("Đã xóa SLA thành công");
    } catch (error) {
      console.error("Failed to delete SLA:", error);
      toast.error("Không thể xóa SLA");
    }
  };

  return {
    slas,
    loading,
    loadSLAs,
    handleDeleteSLA,
  };
}
