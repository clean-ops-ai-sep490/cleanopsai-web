// lib/workarea-checkin-api.ts

import { WorkareaCheckinPoint, WorkareaCheckinPointFormData } from "@/types/workarea-checkin";
import { api } from "./api";
import { createSearchableApi } from "./api-crud-factory";
import { tokenManager } from "./token-manager";


// CRUD factory (giống WorkArea)
const baseApi = createSearchableApi<
  WorkareaCheckinPoint,
  WorkareaCheckinPointFormData,
  WorkareaCheckinPointFormData
>("/WorkareaCheckinPoints");

// ─────────────────────────────
// EXPORT CRUD
// ─────────────────────────────
export const {
  create: createCheckinPoint,
  getById: getCheckinPointById,
  update: updateCheckinPoint,
  delete: deleteCheckinPoint,
  getAll: getCheckinPoints,
  getPaginated: getCheckinPointsPaginated,
} = baseApi;

// ─────────────────────────────
// GET BY WORKAREA
// ─────────────────────────────
export async function getCheckinPointsByWorkarea(workareaId: string) {
  return api.get<WorkareaCheckinPoint[]>(
    `/WorkareaCheckinPoints/workarea/${workareaId}`
  );
}

// ─────────────────────────────
// GET FIRST CHECKIN POINT (used for QR generation logic BE style)
// ─────────────────────────────
export async function getFirstCheckinPoint(workareaId: string) {
  return api.get<WorkareaCheckinPoint>(
    `/WorkareaCheckinPoints/workarea/${workareaId}/first`
  );
}

// ─────────────────────────────
// GET QR IMAGE (PNG)
// ─────────────────────────────
export async function getWorkareaQr(workareaId: string): Promise<Blob> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
  const token = tokenManager.getAccessToken();

  const res = await fetch(
    `${BASE_URL}/WorkareaCheckinPoints/workarea/${workareaId}/qr`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) throw new Error(`QR fetch failed: ${res.status}`);
  return res.blob(); // 👈 trả về Blob PNG trực tiếp, không parse JSON
}