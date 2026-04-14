import { parseArrayResponse } from "./api-response-parser";
import { api } from "./api";
import { Certification } from "@/types/skill";

export interface WorkerCertification {
  id: string;
  workerId: string;
  certificationId: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  certification?: Certification;
}

export async function getWorkerCertifications(
  workerId: string,
): Promise<WorkerCertification[]> {
  const response = await api.get<any>(
    `/WorkerCertifications?workerId=${workerId}`,
  );
  return parseArrayResponse<WorkerCertification>(response);
}
