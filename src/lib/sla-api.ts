import { api } from "./api";
import type {
  SLA,
  CreateSLAData,
  SLAShift,
  CreateSLAShiftData,
  SLATask,
  CreateSLATaskData,
} from "@/types/sla";

// SLA API
export async function createSLA(data: CreateSLAData): Promise<SLA> {
  return api.post<SLA>("/Slas", data);
}

export async function getSLAs(): Promise<SLA[]> {
  const response = await api.get<SLA[] | { data: SLA[] } | any>("/Slas");

  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }

  // If response is wrapped in a data property
  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  // If response has items property (common in paginated APIs)
  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  // Log the actual response structure for debugging
  console.log("Unexpected SLA API response structure:", response);

  // Return empty array as fallback
  return [];
}

export async function getSLAById(id: string): Promise<SLA> {
  return api.get<SLA>(`/Slas/${id}`);
}

export async function updateSLA(
  id: string,
  data: Partial<CreateSLAData>,
): Promise<SLA> {
  return api.put<SLA>(`/Slas/${id}`, data);
}

export async function deleteSLA(id: string): Promise<void> {
  return api.delete(`/Slas/${id}`);
}

// SLA Shift API
export async function createSLAShift(
  data: CreateSLAShiftData,
): Promise<SLAShift> {
  return api.post<SLAShift>("/SlaShifts", data);
}

export async function getSLAShifts(): Promise<SLAShift[]> {
  const response = await api.get<SLAShift[] | { data: SLAShift[] } | any>(
    "/SlaShifts",
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  console.log("Unexpected SLA Shifts API response structure:", response);
  return [];
}

export async function getSLAShiftsBySLA(slaId: string): Promise<SLAShift[]> {
  const response = await api.get<SLAShift[] | { data: SLAShift[] } | any>(
    `/SlaShifts?slaId=${slaId}`,
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  console.log("Unexpected SLA Shifts by SLA API response structure:", response);
  return [];
}

export async function updateSLAShift(
  id: string,
  data: Partial<CreateSLAShiftData>,
): Promise<SLAShift> {
  return api.put<SLAShift>(`/SlaShifts/${id}`, data);
}

export async function deleteSLAShift(id: string): Promise<void> {
  return api.delete(`/SlaShifts/${id}`);
}

// SLA Task API
export async function createSLATask(data: CreateSLATaskData): Promise<SLATask> {
  return api.post<SLATask>("/SlaTasks", data);
}

export async function getSLATasks(): Promise<SLATask[]> {
  const response = await api.get<SLATask[] | { data: SLATask[] } | any>(
    "/SlaTasks",
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  console.log("Unexpected SLA Tasks API response structure:", response);
  return [];
}

export async function getSLATasksBySLA(slaId: string): Promise<SLATask[]> {
  const response = await api.get<SLATask[] | { data: SLATask[] } | any>(
    `/SlaTasks?slaId=${slaId}`,
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.items)) {
    return response.items;
  }

  console.log("Unexpected SLA Tasks by SLA API response structure:", response);
  return [];
}

export async function updateSLATask(
  id: string,
  data: Partial<CreateSLATaskData>,
): Promise<SLATask> {
  return api.put<SLATask>(`/SlaTasks/${id}`, data);
}

export async function deleteSLATask(id: string): Promise<void> {
  return api.delete(`/SlaTasks/${id}`);
}
