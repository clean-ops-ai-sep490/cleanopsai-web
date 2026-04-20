export interface IssueReport {
  id: string;
  taskAssignmentId?: string;
  reportedByWorkerId?: string;
  reportedByWorkerName?: string;
  description: string;
  status: string;
  resolvedByWorkerId?: string | null;
  resolvedAt?: string | null;
  created?: string;
  lastModified?: string;
  displayLocation?: string | null;
  // Computed fields for display (for backward compatibility with mock data)
  title?: string;
  worker?: string;
  location?: string;
  severity?: "low" | "medium" | "high" | "critical";
  createdAt?: string;
  hasPhoto?: boolean;
}

export interface EmergencyAlert {
  id: string;
  worker: string;
  location: string;
  time: string;
  status: "active" | "handling" | "resolved";
  note: string;
}

export interface AdHocRequest {
  id: string;
  type: "adhoc_task" | "equipment";
  requester: string;
  description: string;
  urgency: "normal" | "urgent";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AdHocTaskForm {
  title: string;
  description: string;
  location: string;
  assignee: string;
  priority: "normal" | "urgent";
  deadline: string;
  sopId: string;
}
