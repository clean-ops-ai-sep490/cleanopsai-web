// Contract related types
export interface Client {
  id?: string;
  name: string;
  email: string;
}

export interface Contract {
  id?: string;
  name: string;
  clientId: string;
  file?: File;
  urlFile?: string;
  contractStartDate: string;
  contractEndDate: string;
  clientName?: string;
  created?: string;
}

export interface Location {
  id?: string;
  name: string;
  address: string;
  street: string;
  commune: string;
  province: string;
  latitude: number;
  longitude: number;
  clientId: string;
}

export interface Zone {
  id?: string;
  name: string;
  description: string;
  locationId: string;
}

export interface WorkArea {
  id?: string;
  name: string;
  zoneId: string;
  zoneName?: string; // Add zone name for display
}

// Form data types
export interface ContractFormData {
  name: string;
  clientId: string;
  file?: File;
}

export interface LocationFormData {
  name: string;
  address: string;
  street: string;
  commune: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  clientId: string;
}

export interface ZoneFormData {
  name: string;
  description: string;
  locationId: string;
}

export interface WorkAreaFormData {
  name: string;
  zoneId: string;
}
