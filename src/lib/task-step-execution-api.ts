import { api } from "./api";
import type { TaskStepExecution, SubmitStepExecutionData } from "@/types/task";

// Task Step Execution API Functions (based on actual API spec with consistent endpoint casing)

export async function completeTaskStep(
  id: string,
  data: SubmitStepExecutionData,
): Promise<TaskStepExecution> {
  return api.post<TaskStepExecution>(
    `/TaskStepExecutions/${id}/complete`,
    data,
  );
}

// Helper functions for different action types

export async function completeCheckBoxStep(
  stepExecutionId: string,
  checked: boolean,
  note?: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      checked,
      note: note || "",
    },
  });
}

export async function completePhotoStep(
  stepExecutionId: string,
  photoUrls: string[],
  note?: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      photoUrls,
      note: note || "",
    },
  });
}

export async function completeSignatureStep(
  stepExecutionId: string,
  signatureUrl: string,
  signedBy: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      signatureUrl,
      signedBy,
    },
  });
}

export async function completeTextInputStep(
  stepExecutionId: string,
  text: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      text,
    },
  });
}

export async function completeTimerStep(
  stepExecutionId: string,
  duration: number, // in seconds
  note?: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      duration,
      note: note || "",
    },
  });
}

export async function completeQRCodeStep(
  stepExecutionId: string,
  qrCodeData: string,
  note?: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      qrCodeData,
      note: note || "",
    },
  });
}

export async function completeLocationStep(
  stepExecutionId: string,
  latitude: number,
  longitude: number,
  accuracy?: number,
  note?: string,
): Promise<TaskStepExecution> {
  return completeTaskStep(stepExecutionId, {
    resultData: {
      latitude,
      longitude,
      accuracy,
      note: note || "",
    },
  });
}
