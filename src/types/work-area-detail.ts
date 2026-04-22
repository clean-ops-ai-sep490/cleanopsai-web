// WorkAreaDetail types
export interface WorkAreaDetail {
  id?: string;
  name: string;
  area: number;
  totalArea: number;
  workAreaId: string;
}

export interface CreateWorkAreaDetailData {
  name: string;
  area: number;
  totalArea?: number; // Optional, default to 0
  workAreaId: string;
}

export interface UpdateWorkAreaDetailData {
  name?: string;
  area?: number;
  workAreaId?: string;
}

export interface WorkAreaDetailsPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  workAreaId?: string;
  search?: string;
}
