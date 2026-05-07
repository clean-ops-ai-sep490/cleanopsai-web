import { useCallback, useState } from "react";
import type { WorkArea, WorkAreaFormData } from "@/types/contract";
import type { WorkAreasPaginatedRequest } from "@/lib/work-area-api";

import {
  createWorkArea,
  getWorkAreaById,
  updateWorkArea,
  deleteWorkArea,
  getWorkAreas,
  getWorkAreasPaginatedNew,
} from "@/lib/work-area-api";

export function useWorkArea() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<WorkArea[]>([]);
  const [selected, setSelected] = useState<WorkArea | null>(null);
  const [total, setTotal] = useState(0);

  const handleError = (err: any) => {
    console.error("WorkArea error:", err);
    throw err;
  };

  // ─────────────────────────────
  // GET ALL (for dropdown)
  // ─────────────────────────────
  const fetchAllWorkAreas = useCallback(async () => {
  setLoading(true);
  try {
    // Lấy page 1 trước để biết totalPages
    const first = await getWorkAreasPaginatedNew(1, 100);
    const totalPages = first?.totalPages ?? 1;
    let all = [...(first?.content ?? [])];

    // Nếu có nhiều hơn 1 trang thì fetch tiếp
    if (totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          getWorkAreasPaginatedNew(i + 2, 100)
        )
      );
      rest.forEach((r) => {
        all = [...all, ...(r?.content ?? [])];
      });
    }

    setItems(all);
    setTotal(all.length);
    return all;
  } catch (err) {
    handleError(err);
    return [];
  } finally {
    setLoading(false);
  }
}, []);

  // ─────────────────────────────
  // PAGINATED LIST
  // ─────────────────────────────
  const fetchPaginated = useCallback(
    async (params: WorkAreasPaginatedRequest = {}) => {
      setLoading(true);
      try {
        const res = await getWorkAreasPaginatedNew(
          params.pageNumber ?? 1,
          params.pageSize ?? 100,
          {
            search: params.search,
            zoneId: params.zoneId,
          },
        );

        setItems(res.content);
        setTotal(res.totalElements);

        return res;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─────────────────────────────
  // GET BY ID
  // ─────────────────────────────
  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getWorkAreaById(id);
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
  const create = useCallback(async (data: WorkAreaFormData) => {
    setLoading(true);
    try {
      const res = await createWorkArea(data);
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
  const update = useCallback(async (id: string, data: WorkAreaFormData) => {
    setLoading(true);
    try {
      const res = await updateWorkArea(id, data);

      setItems((prev) =>
        prev.map((w) => (w.id === id ? res : w)),
      );

      return res;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────
  const remove = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteWorkArea(id);

      setItems((prev) => prev.filter((w) => w.id !== id));

      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  

  return {
    // state
    loading,
    items,
    selected,
    total,

    // actions
    fetchAllWorkAreas,
    fetchPaginated,
    fetchById,
    create,
    update,
    remove,
  };
}