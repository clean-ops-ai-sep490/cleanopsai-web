export interface WorkareaCheckinPoint {
  id: string;
  workareaId: string;
  name: string;
  code: string;

  isActive?: boolean;
  isDeleted?: boolean;

  created?: string;
  lastModified?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// dùng cho create + update form (admin UI)
export interface WorkareaCheckinPointFormData {
  workareaId: string;
  name: string;
  code?: string;
}