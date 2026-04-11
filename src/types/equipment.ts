/**
 * Equipment related types
 * Based on API specification and product requirements
 */

// Equipment types
export interface Equipment {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentData {
  name: string;
  type: string; // e.g., "VacuumCleaner"
  description: string;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {}
