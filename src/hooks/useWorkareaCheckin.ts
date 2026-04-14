// hooks/useWorkareaCheckin.ts

import { useCallback, useState } from "react";

import {
  createCheckinPoint,
  getCheckinPointById,
  updateCheckinPoint,
  deleteCheckinPoint,
  getCheckinPoints,
  getCheckinPointsByWorkarea,
  getWorkareaQr,
} from "@/lib/workarea-checkin-api";
import { WorkareaCheckinPoint, WorkareaCheckinPointFormData } from "@/types/workarea-checkin";

export function useWorkareaCheckin() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<WorkareaCheckinPoint[]>([]);
  const [selected, setSelected] = useState<WorkareaCheckinPoint | null>(null);

  const handleError = (err: any) => {
    console.error("WorkareaCheckin error:", err);
    throw err;
  };

  // ─────────────────────────────
  // GET ALL
  // ─────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCheckinPoints();
      setItems(res);
      return res;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // GET BY WORKAREA (dropdown / admin filter)
  // ─────────────────────────────
  const fetchByWorkarea = useCallback(async (workareaId: string) => {
    setLoading(true);
    try {
      const res = await getCheckinPointsByWorkarea(workareaId);
      setItems(res);
      return res;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // GET BY ID
  // ─────────────────────────────
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getCheckinPointById(id);
      setSelected(res);
      return res;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // CREATE
  // ─────────────────────────────
  const create = useCallback(async (data: WorkareaCheckinPointFormData) => {
    setLoading(true);
    try {
      const res = await createCheckinPoint(data);
      setItems((prev) => [res, ...prev]);
      return res;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // UPDATE
  // ─────────────────────────────
  const update = useCallback(
    async (id: string, data: WorkareaCheckinPointFormData) => {
      setLoading(true);
      try {
        const res = await updateCheckinPoint(id, data);

        setItems((prev) =>
          prev.map((x) => (x.id === id ? res : x))
        );

        return res;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────
  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteCheckinPoint(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // QR DOWNLOAD
  // ─────────────────────────────
  const downloadQr = useCallback(async (workareaId: string) => {
    setLoading(true);
    try {
      const blob = await getWorkareaQr(workareaId);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `workarea-${workareaId}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQrUrl = useCallback(async (workareaId: string): Promise<string | null> => {
  try {
    const blob = await getWorkareaQr(workareaId);
    return window.URL.createObjectURL(blob);
  } catch (err) {
    handleError(err);
    return null;
  }
}, []);

  return {
    loading,
    items,
    selected,

    fetchAll,
    fetchByWorkarea,
    fetchById,

    create,
    update,
    remove,

    downloadQr,
    getQrUrl,
  };
}