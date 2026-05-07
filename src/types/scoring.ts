export type ScoringVerdict = "PASS" | "FAIL" | "PENDING" | "UNKNOWN";

export type AnnotationCandidateStatus =
  | "QUEUED"
  | "INPROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type RetrainBatchStatus =
  | "QUEUED"
  | "RUNNING"
  | "FAILED"
  | "PROMOTED"
  | "REJECTED";

export type AnnotationLabelName = "stain_or_water" | "wet_surface";

export interface AnnotationLabel {
  label: AnnotationLabelName;
  shapeType: "rectangle";
  source?: string;
  points: [[number, number], [number, number]];
}

export interface PendingScoringReviewItem {
  resultId: string;
  jobId: string;
  requestId: string;
  submittedByUserId?: string | null;
  workerId?: string | null;
  workerName?: string | null;
  environmentKey: string;
  sourceType: string;
  source: string;
  verdict: ScoringVerdict;
  qualityScore: number;
  createdAt: string;
}

export interface ReviewScoringResultRequest {
  verdict: "PASS" | "FAIL";
  reason?: string;
}

export interface ScoringResultReviewResponse {
  resultId: string;
  jobId: string;
  originalVerdict: string;
  reviewedVerdict: string;
  reviewReason?: string | null;
  reviewedAtUtc: string;
  reviewedByUserId?: string | null;
  reviewedByEmail?: string | null;
}

export interface ScoringAnnotationCandidateListItem {
  candidateId: string;
  resultId: string;
  jobId: string;
  requestId: string;
  environmentKey: string;
  candidateStatus: AnnotationCandidateStatus;
  imageUrl: string;
  visualizationBlobUrl?: string | null;
  originalVerdict: string;
  reviewedVerdict: string;
  sourceType: string;
  assignedToUserId?: string | null;
  createdAtUtc: string;
  submittedAtUtc?: string | null;
  approvedAtUtc?: string | null;
  hasAnnotation: boolean;
  annotationVersion?: number | null;
}

export interface ScoringAnnotationCandidateDetail
  extends ScoringAnnotationCandidateListItem {
  payloadJson: string;
  preAnnotationJson: string;
  snapshotBlobKey?: string | null;
  metadataBlobKey?: string | null;
  annotation?: ScoringAnnotation | null;
}

export interface ScoringAnnotation {
  annotationId: string;
  annotationFormat: "bbox-region-v1" | string;
  labelsJson: string;
  reviewerNote?: string | null;
  version: number;
  createdByUserId?: string | null;
  approvedByUserId?: string | null;
  lastModifiedUtc: string;
}

export interface UpsertScoringAnnotationRequest {
  annotationFormat?: "bbox-region-v1";
  labels: AnnotationLabel[];
  reviewerNote?: string;
  submit: boolean;
}

export interface ScoringRetrainBatchListItem {
  batchId: string;
  status: RetrainBatchStatus;
  requestedAtUtc: string;
  sourceWindowFromUtc: string;
  reviewedSampleCount: number;
  annotatedSampleCount: number;
  approvedAnnotationCount: number;
  eligibleApprovedAnnotationCount: number;
  alreadyTrainedAnnotationCount: number;
  selectedAnnotationCount: number;
  calibrationSampleCount: number;
  completedAtUtc?: string | null;
  promoted: boolean;
  failureReason?: string | null;
  promotionReason?: string | null;
  metricKey?: string | null;
  candidateMetric?: number | null;
  baselineMetric?: number | null;
  minimumImprovement?: number | null;
  runCount: number;
  latestRunStartedAtUtc?: string | null;
  runs?: ScoringRetrainRun[];
}

export interface ScoringRetrainBatchDetail extends ScoringRetrainBatchListItem {
  metricKey?: string | null;
  candidateMetric?: number | null;
  baselineMetric?: number | null;
  minimumImprovement?: number | null;
  runs: ScoringRetrainRun[];
}

export interface ScoringRetrainRun {
  runId: string;
  status: string;
  mode: string;
  startedAtUtc: string;
  completedAtUtc?: string | null;
  exitCode?: number | null;
  message?: string | null;
  logs?: string | null;
}

export interface TriggerScoringRetrainRequest {
  lookbackDays: number;
  minReviewedSamples: number;
  minApprovedAnnotations: number;
  maxSamplesPerBatch: number;
  includeRejectedTrainingSamples?: boolean;
  useLastBatchTime?: boolean;
}
