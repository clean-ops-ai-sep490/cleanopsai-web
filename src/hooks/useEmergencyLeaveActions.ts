"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getTaskAssignments,
  updateTaskAssignment,
  updateTaskAssignmentStatus,
} from "@/lib/task-assignment-api";
import {
  reviewEmergencyLeaveRequest,
  type EmergencyLeaveRequest,
} from "@/lib/emergency-leave-request-api";
import { filterWorkers, type Worker } from "@/lib/worker-api";
import type {
  TaskAssignment,
  TaskAssignmentUpdatePayload,
} from "@/types/task-assignment";
import { toastUtils } from "@/lib/utils/toast-utils";

// Action types for each task
export type TaskAction =
  | "REASSIGN_START"
  | "REASSIGN_LATER"
  | "KEEP_CONTINUE"
  | null;

// Per-task decision state
export interface TaskDecision {
  taskId: string;
  action: TaskAction;
  selectedWorker: Worker | null;
  scheduledStartAt?: string;
  durationMinutes?: number;
}

// Result of executing an action on a task
export interface TaskActionResult {
  taskId: string;
  success: boolean;
  error?: string;
  action: TaskAction;
}

export function useEmergencyLeaveActions() {
  const queryClient = useQueryClient();

  // Affected tasks for the selected request
  const [affectedTasks, setAffectedTasks] = useState<TaskAssignment[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Per-task decisions
  const [decisions, setDecisions] = useState<Record<string, TaskDecision>>({});

  // Available workers per task (keyed by taskId)
  const [availableWorkers, setAvailableWorkers] = useState<
    Record<string, Worker[]>
  >({});
  const [loadingWorkers, setLoadingWorkers] = useState<
    Record<string, boolean>
  >({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<TaskActionResult[]>([]);

  /**
   * Fetch affected tasks for a leave request
   */
  const fetchAffectedTasks = useCallback(
    async (request: EmergencyLeaveRequest) => {
      setLoadingTasks(true);
      setAffectedTasks([]);
      setDecisions({});
      setResults([]);

      try {
        const response = await getTaskAssignments({
          assigneeId: request.workerId,
          fromDate: request.leaveDateFrom,
          toDate: request.leaveDateTo,
          pageSize: 100,
        });

        const allTasks = response.content || [];

        // Client-side filtering: Only include tasks that strictly overlap with the leave period
        const leaveStart = new Date(request.leaveDateFrom).getTime();
        const leaveEnd = new Date(request.leaveDateTo).getTime();

        const filteredTasks = allTasks.filter((task) => {
          const taskStart = new Date(task.scheduledStartAt).getTime();
          const taskEnd = new Date(task.scheduledEndAt).getTime();
          return taskStart < leaveEnd && taskEnd > leaveStart;
        });

        // Sort tasks: InProgress first, then by Start time
        const tasks = filteredTasks.sort((a, b) => {
          if (a.status === "InProgress" && b.status !== "InProgress") return -1;
          if (a.status !== "InProgress" && b.status === "InProgress") return 1;
          return (
            new Date(a.scheduledStartAt).getTime() -
            new Date(b.scheduledStartAt).getTime()
          );
        });

        setAffectedTasks(tasks);

        // Decisions are now manual, no auto-Block
        const autoDecisions: Record<string, TaskDecision> = {};
        for (const task of tasks) {
          autoDecisions[task.id] = {
            taskId: task.id,
            action: null,
            selectedWorker: null,
            scheduledStartAt: task.scheduledStartAt,
            durationMinutes: task.durationMinutes,
          };
        }
        setDecisions(autoDecisions);

        return tasks;
      } catch (error) {
        console.error("Error fetching affected tasks:", error);
        toastUtils.error("Không thể tải danh sách task bị ảnh hưởng");
        return [];
      } finally {
        setLoadingTasks(false);
      }
    },
    [],
  );

  /**
   * Fetch available workers for a specific task
   */
  const fetchAvailableWorkers = useCallback(
    async (task: TaskAssignment) => {
      setLoadingWorkers((prev) => ({ ...prev, [task.id]: true }));

      try {
        // Extract time parts from scheduledStartAt and scheduledEndAt
        const startTime = new Date(task.scheduledStartAt)
          .toTimeString()
          .slice(0, 8);
        const endTime = new Date(task.scheduledEndAt)
          .toTimeString()
          .slice(0, 8);

        const response = await filterWorkers({
          address: task.displayLocation,
          startAt: startTime,
          endAt: endTime,
        });

        const workers = response.content || [];
        setAvailableWorkers((prev) => ({ ...prev, [task.id]: workers }));
        return workers;
      } catch (error) {
        console.error("Error fetching available workers:", error);
        toastUtils.error("Không thể tải danh sách worker khả dụng");
        return [];
      } finally {
        setLoadingWorkers((prev) => ({ ...prev, [task.id]: false }));
      }
    },
    [],
  );

  /**
   * Set action for a specific task
   */
  const setTaskAction = useCallback(
    (taskId: string, action: TaskAction) => {
      setDecisions((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          taskId,
          action,
          // Reset worker selection when changing action
          selectedWorker:
            action === "KEEP_CONTINUE"
              ? null
              : prev[taskId]?.selectedWorker ?? null,
        },
      }));
    },
    [],
  );

  /**
   * Set selected worker for a specific task
   */
  const setTaskWorker = useCallback(
    (taskId: string, worker: Worker | null) => {
      setDecisions((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          taskId,
          selectedWorker: worker,
        },
      }));
    },
    [],
  );

  /**
   * Update specific fields in a task decision
   */
  const updateTaskDecision = useCallback(
    (taskId: string, updates: Partial<TaskDecision>) => {
      setDecisions((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          ...updates,
          taskId,
        },
      }));
    },
    [],
  );

  /**
   * Execute reassign + status update for a single task
   */
  const executeTaskAction = useCallback(
    async (
      task: TaskAssignment,
      decision: TaskDecision,
    ): Promise<TaskActionResult> => {
      const { action, selectedWorker } = decision;

      try {
        if (action === "REASSIGN_START" || action === "REASSIGN_LATER") {
          if (!selectedWorker) {
            return {
              taskId: task.id,
              success: false,
              error: "Chưa chọn worker thay thế",
              action,
            };
          }

          // Step 1: PUT - full update with new assignee and potentially new time
          const payload: TaskAssignmentUpdatePayload = {
            taskName: task.taskName || task.nameAdhocTask || "",
            scheduledStartAt: decision.scheduledStartAt || task.scheduledStartAt,
            durationMinutes: decision.durationMinutes ?? task.durationMinutes,
            assigneeId: selectedWorker.id,
            assigneeName: selectedWorker.fullName,
            displayLocation: task.displayLocation,
          };

          await updateTaskAssignment(task.id, payload);

          // Step 2: PATCH - update status
          const newStatus =
            action === "REASSIGN_START" ? "InProgress" : "NotStarted";
          await updateTaskAssignmentStatus(task.id, newStatus);
        } else if (action === "KEEP_CONTINUE") {
          // Only PATCH status
          await updateTaskAssignmentStatus(task.id, "InProgress");
        }

        return { taskId: task.id, success: true, action };
      } catch (error: any) {
        return {
          taskId: task.id,
          success: false,
          error: error?.message || "Lỗi không xác định",
          action,
        };
      }
    },
    [],
  );

  /**
   * Approve a leave request: execute all task actions then approve
   */
  const approveRequest = useCallback(
    async (request: EmergencyLeaveRequest): Promise<boolean> => {
      setSubmitting(true);
      setResults([]);

      try {
        // Validate all active tasks have actions (InProgress or Block)
        const activeTasks = affectedTasks.filter(
          (t) => t.status !== "Completed" && t.status !== "Cancelled"
        );
        const missingActions = activeTasks.filter(
          (t) => !decisions[t.id]?.action,
        );

        if (missingActions.length > 0) {
          toastUtils.error(
            `Còn ${missingActions.length} task chưa được xử lý`,
          );
          setSubmitting(false);
          return false;
        }

        // Validate reassign tasks have workers
        const reassignTasks = activeTasks.filter(
          (t) =>
            decisions[t.id]?.action === "REASSIGN_START" ||
            decisions[t.id]?.action === "REASSIGN_LATER",
        );
        const missingWorkers = reassignTasks.filter(
          (t) => !decisions[t.id]?.selectedWorker,
        );

        if (missingWorkers.length > 0) {
          toastUtils.error(
            `Còn ${missingWorkers.length} task chưa chọn worker thay thế`,
          );
          setSubmitting(false);
          return false;
        }

        // Execute all task actions
        const actionResults: TaskActionResult[] = [];
        for (const task of activeTasks) {
          const decision = decisions[task.id];
          if (decision?.action) {
            const result = await executeTaskAction(task, decision);
            actionResults.push(result);
          }
        }

        setResults(actionResults);

        // Check for failures
        const failures = actionResults.filter((r) => !r.success);
        if (failures.length > 0) {
          toastUtils.error(
            `${failures.length}/${actionResults.length} task xử lý thất bại`,
          );
          return false;
        }

        // All tasks handled - approve the leave request
        await reviewEmergencyLeaveRequest(request.id, {
          status: "Approved",
        });

        toastUtils.success("Đã duyệt yêu cầu nghỉ phép khẩn cấp");
        queryClient.invalidateQueries({
          queryKey: ["emergency-leave-requests"],
        });
        queryClient.invalidateQueries({ queryKey: ["task-assignments"] });

        return true;
      } catch (error) {
        console.error("Error approving request:", error);
        toastUtils.error("Không thể duyệt yêu cầu");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [affectedTasks, decisions, executeTaskAction, queryClient],
  );

  /**
   * Reject a leave request: PATCH all affected tasks back to InProgress
   */
  const rejectRequest = useCallback(
    async (request: EmergencyLeaveRequest): Promise<boolean> => {
      setSubmitting(true);
      setResults([]);

      try {
        // PATCH all affected tasks back to InProgress or NotStarted depending on original
        const activeTasks = affectedTasks.filter(
          (t) => t.status !== "Completed" && t.status !== "Cancelled"
        );
        const actionResults: TaskActionResult[] = [];

        for (const task of activeTasks) {
          try {
            // If it was Block, it's safer to move to InProgress if we reject the leave
            // If it was already InProgress, keep it.
            await updateTaskAssignmentStatus(task.id, "InProgress");
            actionResults.push({
              taskId: task.id,
              success: true,
              action: "KEEP_CONTINUE",
            });
          } catch (error: any) {
            actionResults.push({
              taskId: task.id,
              success: false,
              error: error?.message || "Lỗi",
              action: "KEEP_CONTINUE",
            });
          }
        }

        setResults(actionResults);

        // Reject the leave request
        await reviewEmergencyLeaveRequest(request.id, {
          status: "Rejected",
        });

        toastUtils.success("Đã từ chối yêu cầu nghỉ phép khẩn cấp");
        queryClient.invalidateQueries({
          queryKey: ["emergency-leave-requests"],
        });
        queryClient.invalidateQueries({ queryKey: ["task-assignments"] });

        return true;
      } catch (error) {
        console.error("Error rejecting request:", error);
        toastUtils.error("Không thể từ chối yêu cầu");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [affectedTasks, queryClient],
  );

  /**
   * Retry failed task actions
   */
  const retryFailed = useCallback(async () => {
    const failedResults = results.filter((r) => !r.success);
    if (failedResults.length === 0) return;

    setSubmitting(true);
    const newResults = [...results];

    for (const failed of failedResults) {
      const task = affectedTasks.find((t) => t.id === failed.taskId);
      const decision = decisions[failed.taskId];
      if (task && decision?.action) {
        const result = await executeTaskAction(task, decision);
        const idx = newResults.findIndex((r) => r.taskId === failed.taskId);
        if (idx >= 0) newResults[idx] = result;
      }
    }

    setResults(newResults);
    setSubmitting(false);
  }, [results, affectedTasks, decisions, executeTaskAction]);

  /**
   * Set all Block tasks to a specific action (bulk)
   */
  const setBulkAction = useCallback(
    (action: TaskAction) => {
      setDecisions((prev) => {
        const updated = { ...prev };
        for (const task of affectedTasks) {
          const isActive = task.status !== "Completed" && task.status !== "Cancelled";
          if (isActive) {
            updated[task.id] = {
              ...updated[task.id],
              taskId: task.id,
              action,
              selectedWorker:
                action === "KEEP_CONTINUE"
                  ? null
                  : updated[task.id]?.selectedWorker ?? null,
            };
          }
        }
        return updated;
      });
    },
    [affectedTasks],
  );

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setAffectedTasks([]);
    setDecisions({});
    setAvailableWorkers({});
    setLoadingWorkers({});
    setResults([]);
    setSubmitting(false);
    setLoadingTasks(false);
  }, []);

  return {
    // State
    affectedTasks,
    loadingTasks,
    decisions,
    availableWorkers,
    loadingWorkers,
    submitting,
    results,

    // Actions
    fetchAffectedTasks,
    fetchAvailableWorkers,
    setTaskAction,
    setTaskWorker,
    approveRequest,
    rejectRequest,
    retryFailed,
    setBulkAction,
    updateTaskDecision,
    reset,
  };
}
