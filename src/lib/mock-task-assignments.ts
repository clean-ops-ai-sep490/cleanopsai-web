import type {
  TaskAssignment,
  TaskAssignmentResponse,
} from "@/types/task-assignment";

// Generate mock task assignments for 10 workers
export function generateMockTaskAssignments(
  fromDate: string,
  toDate: string,
): TaskAssignmentResponse {
  const workers = [
    { id: "worker-1", name: "Nguyễn Văn A" },
    { id: "worker-2", name: "Trần Thị B" },
    { id: "worker-3", name: "Lê Văn C" },
    { id: "worker-4", name: "Phạm Thị D" },
    { id: "worker-5", name: "Hoàng Văn E" },
    { id: "worker-6", name: "Vũ Thị F" },
    { id: "worker-7", name: "Đặng Văn G" },
    { id: "worker-8", name: "Bùi Thị H" },
    { id: "worker-9", name: "Cao Văn I" },
    { id: "worker-10", name: "Dương Thị J" },
  ];

  const locations = [
    "Tòa nhà A, Quận 1, TP.HCM",
    "Tòa nhà B, Quận 3, TP.HCM",
    "Tòa nhà C, Quận 5, TP.HCM",
    "Tòa nhà D, Quận 7, TP.HCM",
    "Tòa nhà E, Quận 10, TP.HCM",
  ];

  const statuses: Array<
    "NotStarted" | "InProgress" | "Completed" | "Cancelled"
  > = ["NotStarted", "InProgress", "Completed"];

  const tasks: TaskAssignment[] = [];
  const baseDate = new Date(fromDate);

  workers.forEach((worker, workerIndex) => {
    // Each worker gets 2-3 tasks
    const taskCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < taskCount; i++) {
      // Random start time between 6 AM and 4 PM
      const startHour = 6 + Math.floor(Math.random() * 11);
      const startMinute = Math.random() > 0.5 ? 0 : 30;

      // Duration: 1-3 hours
      const duration = 1 + Math.floor(Math.random() * 3);

      const scheduledStartAt = new Date(baseDate);
      scheduledStartAt.setHours(startHour, startMinute, 0, 0);

      const scheduledEndAt = new Date(scheduledStartAt);
      scheduledEndAt.setHours(scheduledEndAt.getHours() + duration);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[workerIndex % locations.length];
      const isAdhocTask = Math.random() > 0.7;

      tasks.push({
        id: `task-${workerIndex}-${i}`,
        taskScheduleId: `schedule-${workerIndex}-${i}`,
        taskName: isAdhocTask ? "Vệ sinh khẩn cấp" : `Công việc ${i + 1}`,
        assigneeId: worker.id,
        originalAssigneeId: worker.id,
        status,
        scheduledStartAt: scheduledStartAt.toISOString(),
        scheduledEndAt: scheduledEndAt.toISOString(),
        durationMinutes: duration * 60,
        isAdhocTask,
        nameAdhocTask: isAdhocTask ? "Vệ sinh khẩn cấp" : null,
        displayLocation: location,
        assigneeName: worker.name,
        originalAssigneeName: worker.name,
        steps: [],
      });
    }
  });

  return {
    pageNumber: 1,
    pageSize: 500,
    totalElements: tasks.length,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    content: tasks,
  };
}
