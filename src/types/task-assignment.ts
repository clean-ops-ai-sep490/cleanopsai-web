export interface TaskAssignment {
  id: string;
  taskScheduleId: string;
  taskName: string;
  assigneeId: string;
  originalAssigneeId: string;
  status: "NotStarted" | "InProgress" | "Completed" | "Cancelled" | "Block";
  scheduledStartAt: string;
  scheduledEndAt: string;
  durationMinutes: number;
  isAdhocTask: boolean;
  nameAdhocTask: string | null;
  displayLocation: string;
  assigneeName: string;
  originalAssigneeName: string;
  steps: any[];
}

export interface TaskAssignmentUpdatePayload {
  taskName: string;
  scheduledStartAt: string;
  durationMinutes: number;
  assigneeId: string;
  assigneeName: string;
  displayLocation: string;
}

export interface TaskAssignmentResponse {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  content: TaskAssignment[];
}

export interface TaskAssignmentFilters {
  assigneeId?: string;
  workAreaId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  isAdhocTask?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
