import { api } from "./api";
import type {
  PendingScoringReviewItem,
  ReviewScoringResultRequest,
  ScoringAnnotationCandidateDetail,
  ScoringAnnotationCandidateListItem,
  ScoringResultReviewResponse,
  ScoringRetrainBatchDetail,
  ScoringRetrainBatchListItem,
  TriggerScoringRetrainRequest,
  UpsertScoringAnnotationRequest,
} from "@/types/scoring";

export interface AnnotationCandidateFilters {
  status?: string;
  environmentKey?: string;
  assignedTo?: string;
  createdFrom?: string;
  take?: number;
}

export interface RetrainBatchFilters {
  status?: string;
  take?: number;
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value && value !== "all"),
  ) as Record<string, string>;
}

export async function getPendingScoringReviews(take = 100) {
  return api.get<PendingScoringReviewItem[]>("/scoring/reviews/pending", {
    params: { take: String(take) },
  });
}

export async function reviewScoringResult(
  resultId: string,
  data: ReviewScoringResultRequest,
) {
  return api.put<ScoringResultReviewResponse>(
    `/scoring/reviews/results/${resultId}`,
    data,
  );
}

export async function getAnnotationCandidates(
  filters: AnnotationCandidateFilters = {},
) {
  return api.get<ScoringAnnotationCandidateListItem[]>(
    "/scoring/annotations/candidates",
    {
      params: cleanParams({
        status: filters.status,
        environmentKey: filters.environmentKey,
        assignedTo: filters.assignedTo,
        createdFrom: filters.createdFrom,
        take: filters.take ? String(filters.take) : "50",
      }),
    },
  );
}

export async function getAnnotationCandidate(candidateId: string) {
  return api.get<ScoringAnnotationCandidateDetail>(
    `/scoring/annotations/candidates/${candidateId}`,
  );
}

export async function claimAnnotationCandidate(candidateId: string) {
  return api.post<ScoringAnnotationCandidateDetail>(
    `/scoring/annotations/candidates/${candidateId}/claim`,
  );
}

export async function upsertScoringAnnotation(
  candidateId: string,
  data: UpsertScoringAnnotationRequest,
) {
  return api.put<ScoringAnnotationCandidateDetail>(
    `/scoring/annotations/candidates/${candidateId}/annotation`,
    data,
  );
}

export async function approveAnnotationCandidate(
  candidateId: string,
  note?: string,
) {
  return api.post<ScoringAnnotationCandidateDetail>(
    `/scoring/annotations/candidates/${candidateId}/approve`,
    note ? { note } : {},
  );
}

export async function rejectAnnotationCandidate(
  candidateId: string,
  reason?: string,
) {
  return api.post<ScoringAnnotationCandidateDetail>(
    `/scoring/annotations/candidates/${candidateId}/reject`,
    reason ? { reason } : {},
  );
}

export async function getRetrainBatches(filters: RetrainBatchFilters = {}) {
  return api.get<ScoringRetrainBatchListItem[]>("/scoring/retrain/batches", {
    params: cleanParams({
      status: filters.status,
      take: filters.take ? String(filters.take) : "50",
    }),
  });
}

export async function getRetrainBatch(batchId: string) {
  return api.get<ScoringRetrainBatchDetail>(
    `/scoring/retrain/batches/${batchId}`,
  );
}

export async function triggerRetrainBatch(data: TriggerScoringRetrainRequest) {
  return api.post<ScoringRetrainBatchDetail>(
    "/scoring/retrain/batches/trigger",
    data,
  );
}
