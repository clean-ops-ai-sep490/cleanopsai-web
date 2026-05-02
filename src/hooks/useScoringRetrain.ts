import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAnnotationCandidate,
  claimAnnotationCandidate,
  getAnnotationCandidate,
  getAnnotationCandidates,
  getPendingScoringReviews,
  getRetrainBatch,
  getRetrainBatches,
  rejectAnnotationCandidate,
  reviewScoringResult,
  triggerRetrainBatch,
  upsertScoringAnnotation,
  type AnnotationCandidateFilters,
  type RetrainBatchFilters,
} from "@/lib/scoring-api";
import type {
  ReviewScoringResultRequest,
  TriggerScoringRetrainRequest,
  UpsertScoringAnnotationRequest,
} from "@/types/scoring";

export const scoringKeys = {
  pendingReviews: ["scoring", "reviews", "pending"] as const,
  annotationCandidates: (filters?: AnnotationCandidateFilters) =>
    ["scoring", "annotations", filters] as const,
  annotationCandidate: (candidateId: string) =>
    ["scoring", "annotations", candidateId] as const,
  retrainBatches: (filters?: RetrainBatchFilters) =>
    ["scoring", "retrain", "batches", filters] as const,
  retrainBatch: (batchId: string) =>
    ["scoring", "retrain", "batches", batchId] as const,
};

export function usePendingScoringReviews(take = 100) {
  return useQuery({
    queryKey: [...scoringKeys.pendingReviews, take],
    queryFn: () => getPendingScoringReviews(take),
  });
}

export function useReviewScoringResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resultId,
      data,
    }: {
      resultId: string;
      data: ReviewScoringResultRequest;
    }) => reviewScoringResult(resultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoringKeys.pendingReviews });
      queryClient.invalidateQueries({ queryKey: ["scoring", "annotations"] });
    },
  });
}

export function useAnnotationCandidates(filters: AnnotationCandidateFilters) {
  return useQuery({
    queryKey: scoringKeys.annotationCandidates(filters),
    queryFn: () => getAnnotationCandidates(filters),
  });
}

export function useAnnotationCandidate(candidateId: string) {
  return useQuery({
    queryKey: scoringKeys.annotationCandidate(candidateId),
    queryFn: () => getAnnotationCandidate(candidateId),
    enabled: Boolean(candidateId),
  });
}

export function useClaimAnnotationCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimAnnotationCandidate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scoring", "annotations"] });
      queryClient.setQueryData(
        scoringKeys.annotationCandidate(data.candidateId),
        data,
      );
    },
  });
}

export function useUpsertScoringAnnotation(candidateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertScoringAnnotationRequest) =>
      upsertScoringAnnotation(candidateId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scoring", "annotations"] });
      queryClient.setQueryData(
        scoringKeys.annotationCandidate(data.candidateId),
        data,
      );
    },
  });
}

export function useApproveAnnotationCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, note }: { candidateId: string; note?: string }) =>
      approveAnnotationCandidate(candidateId, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scoring", "annotations"] });
      queryClient.setQueryData(
        scoringKeys.annotationCandidate(data.candidateId),
        data,
      );
    },
  });
}

export function useRejectAnnotationCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateId,
      reason,
    }: {
      candidateId: string;
      reason?: string;
    }) => rejectAnnotationCandidate(candidateId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scoring", "annotations"] });
      queryClient.setQueryData(
        scoringKeys.annotationCandidate(data.candidateId),
        data,
      );
    },
  });
}

export function useRetrainBatches(filters: RetrainBatchFilters) {
  return useQuery({
    queryKey: scoringKeys.retrainBatches(filters),
    queryFn: () => getRetrainBatches(filters),
    refetchInterval: (query) => {
      const batches = query.state.data;
      return batches?.some((batch) =>
        ["QUEUED", "RUNNING"].includes(batch.status),
      )
        ? 8000
        : false;
    },
  });
}

export function useRetrainBatch(batchId: string) {
  return useQuery({
    queryKey: scoringKeys.retrainBatch(batchId),
    queryFn: () => getRetrainBatch(batchId),
    enabled: Boolean(batchId),
  });
}

export function useTriggerRetrainBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TriggerScoringRetrainRequest) =>
      triggerRetrainBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring", "retrain"] });
    },
  });
}
