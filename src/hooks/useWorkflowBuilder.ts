/**
 * Workflow Builder Hooks
 *
 * This file contains hooks specifically for workflow building functionality.
 * For other domains, use their respective hook files:
 * - useTaskAssignments.ts - Task assignment queries
 * - useTaskActions.ts - Task actions (start, complete, etc.)
 * - useTaskStepExecution.ts - Task step execution
 * - useSOPs.ts - SOP management
 * - useSteps.ts - Step management
 */

import { useState, useCallback } from "react";

// Re-export hooks from their respective files for backward compatibility
// TODO: Update imports in components to use specific hook files directly
export {
  useTaskAssignments,
  useTaskAssignment,
  useTaskAssignmentsByWorker,
  useTaskAssignmentsByWorkArea,
  useTaskAssignmentsByStatus,
  useTaskAssignmentsByDateRange,
} from "./useTaskAssignments";

export {
  useStartTask,
  useCompleteTask,
  useCreateAdhocTask,
} from "./useTaskActions";

export {
  useCompleteTaskStep,
  useCompleteCheckBoxStep,
  useCompletePhotoStep,
  useCompleteSignatureStep,
  useCompleteTextInputStep,
} from "./useTaskStepExecution";

export {
  useSOPs,
  useSOP,
  useCreateSOP,
  useUpdateSOP,
  useDeleteSOP,
} from "./useSOPs";

export {
  useSteps,
  useStep,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "./useSteps";

/**
 * Hook for managing workflow builder state
 */
export function useWorkflowBuilder() {
  const [selectedSOP, setSelectedSOP] = useState<string | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const addStep = useCallback((stepId: string) => {
    setSelectedSteps((prev) => [...prev, stepId]);
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSelectedSteps((prev) => prev.filter((id) => id !== stepId));
  }, []);

  const clearWorkflow = useCallback(() => {
    setSelectedSOP(null);
    setSelectedSteps([]);
    setIsBuilding(false);
  }, []);

  return {
    selectedSOP,
    setSelectedSOP,
    selectedSteps,
    setSelectedSteps,
    isBuilding,
    setIsBuilding,
    addStep,
    removeStep,
    clearWorkflow,
  };
}
