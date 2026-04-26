export interface TaskAssignment {
  id: string;
  taskScheduleId: string;
  assigneeId: string;
  originalAssigneeId: string;
  status: "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  scheduledStartAt: string;
  scheduledEndAt: string;
  isAdhocTask: boolean;
  nameAdhocTask: string | null;
  displayLocation: string;
  assigneeName: string;
  originalAssigneeName: string;
  steps: any[];
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
  fromDate?: string;
  toDate?: string;
  status?: string;
  isAdhocTask?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
