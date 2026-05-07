import { createSearchableApi } from "./api-crud-factory";
import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import type {
  SLA,
  CreateSLAData,
  SLAShift,
  CreateSLAShiftData,
  SLATask,
  CreateSLATaskData,
} from "@/types/sla";

// SLA API using CRUD factory with consistent endpoint casing
const slaApi = createSearchableApi<SLA, CreateSLAData, Partial<CreateSLAData>>(
  "/Slas",
);

export const {
  create: createSLA,
  getById: getSLAById,
  update: updateSLA,
  delete: deleteSLA,
  getAll: getSLAs,
  getPaginated: getSLAsPaginated,
  search: searchSLAs,
} = slaApi;

// SLA Shift API using CRUD factory with consistent endpoint casing
const slaShiftApi = createSearchableApi<
  SLAShift,
  CreateSLAShiftData,
  Partial<CreateSLAShiftData>
>("/SlaShifts");

export const {
  create: createSLAShift,
  getById: getSLAShiftById,
  update: updateSLAShift,
  delete: deleteSLAShift,
  getAll: getSLAShifts,
  getPaginated: getSLAShiftsPaginated,
  search: searchSLAShifts,
} = slaShiftApi;

// Custom function for getting SLA shifts by SLA ID
export async function getSLAShiftsBySLA(slaId: string): Promise<SLAShift[]> {
  const response = await api.get<any>(`/SlaShifts/sla/${slaId}`);
  return parseArrayResponse<SLAShift>(response);
}

// SLA Task API using CRUD factory with consistent endpoint casing
const slaTaskApi = createSearchableApi<
  SLATask,
  CreateSLATaskData,
  Partial<CreateSLATaskData>
>("/SlaTasks");

export const {
  create: createSLATask,
  getById: getSLATaskById,
  update: updateSLATask,
  delete: deleteSLATask,
  getAll: getSLATasks,
  getPaginated: getSLATasksPaginated,
  search: searchSLATasks,
} = slaTaskApi;

// Custom function for getting SLA tasks by SLA ID
export async function getSLATasksBySLA(slaId: string): Promise<SLATask[]> {
  const response = await api.get<any>(`/SlaTasks/sla/${slaId}`);
  return parseArrayResponse<SLATask>(response);
}
