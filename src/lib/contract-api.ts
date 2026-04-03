import { api } from "./api";
import type {
  Client,
  Contract,
  Location,
  Zone,
  WorkArea,
  ContractFormData,
  LocationFormData,
  ZoneFormData,
  WorkAreaFormData,
} from "@/types/contract";

// Client API
export async function createClient(data: {
  name: string;
  email: string;
}): Promise<Client> {
  return api.post<Client>("/Clients", data);
}

export async function getClients(): Promise<Client[]> {
  return api.get<Client[]>("/Clients");
}

// Contract API
export async function createContract(
  data: ContractFormData,
): Promise<Contract> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("clientId", data.clientId);

  if (data.file) {
    formData.append("file", data.file);
  }

  return api.post<Contract>("/Contracts", formData);
}

export async function getContracts(): Promise<Contract[]> {
  return api.get<Contract[]>("/Contracts");
}

// Location API
export async function createLocation(
  data: LocationFormData,
): Promise<Location> {
  return api.post<Location>("/Locations", data);
}

export async function getLocations(): Promise<Location[]> {
  return api.get<Location[]>("/Locations");
}

export async function getLocationsByClient(
  clientId: string,
): Promise<Location[]> {
  return api.get<Location[]>(`/Locations?clientId=${clientId}`);
}

// Zone API
export async function createZone(data: ZoneFormData): Promise<Zone> {
  return api.post<Zone>("/Zones", data);
}

export async function getZones(): Promise<Zone[]> {
  return api.get<Zone[]>("/Zones");
}

export async function getZonesByLocation(locationId: string): Promise<Zone[]> {
  return api.get<Zone[]>(`/Zones?locationId=${locationId}`);
}

// Work Area API
export async function createWorkArea(
  data: WorkAreaFormData,
): Promise<WorkArea> {
  return api.post<WorkArea>("/WorkAreas", data);
}

export async function getWorkAreas(): Promise<WorkArea[]> {
  return api.get<WorkArea[]>("/WorkAreas");
}

export async function getWorkAreasByZone(zoneId: string): Promise<WorkArea[]> {
  return api.get<WorkArea[]>(`/WorkAreas?zoneId=${zoneId}`);
}
