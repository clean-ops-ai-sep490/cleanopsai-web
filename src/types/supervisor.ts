// Supervisor types - based on actual API response
export interface Supervisor {
  id: string;
  email: string;
  fullName: string;
  role: string; // "Supervisor"
}

export interface SupervisorsPaginatedRequest {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}
