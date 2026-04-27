// Pipeline types
export interface PipelineHealth {
  source_name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  last_run: string;
  last_completed: string | null;
  records_ingested: number;
  error_count: number;
  error_log: string | null;
  is_healthy: boolean;
}

export interface PipelineHistoryEntry {
  id: string;
  source_name: string;
  started_at: string;
  completed_at: string | null;
  status: 'success' | 'failed' | 'running';
  records_ingested: number;
  error_count: number;
  error_message: string | null;
}

export interface PipelineUptime {
  hours: number;
  uptime_percentage: number;
  total_runs: number;
  successful_runs: number;
}

// Model metrics types
export interface ModelMetrics {
  model_version: string;
  gini_coefficient: number;
  psi_per_feature: Record<string, number>;
  ks_statistic: number;
  score_distribution: { buckets: string[]; counts: number[] };
  total_scores_computed: number;
  last_updated: string;
}

export interface PSIAlert {
  feature: string;
  psi_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  threshold: number;
}

export interface ScoreDistribution {
  buckets: string[];
  counts: number[];
}

export interface RetrainJob {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  message: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'terminated';
  environment: 'sandbox' | 'production';
  tier_access: string[];
  rate_limit: number;
  dpa_signed_date: string | null;
  api_key_prefix: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  environment: 'sandbox' | 'production';
  tier_access: string[];
  rate_limit: number;
}

export interface CreateClientResponse {
  client: Client;
  rawApiKey: string;
}

export interface RotateKeyResponse {
  client: Client;
  rawApiKey: string;
}

// Consent types
export interface ConsentEntry {
  id: string;
  consent_id: string;
  event_type: 'granted' | 'updated' | 'withdrawn' | 'expired';
  timestamp: string;
  client_id: string;
  client_name: string;
  data_subject_id: string;
  hash: string;
  previous_hash: string | null;
  metadata: Record<string, unknown>;
}

export interface ConsentVerification {
  isValid: boolean;
  firstInvalidEntry: string | null;
  totalEntries: number;
}

export interface ConsentQueryParams {
  consent_id?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | undefined;
}

// Health check
export interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Scoring API types (partner portal) ───────────────────────
export interface ScoreRequest {
  bvn: string;
  phone: string;
  loan_amount?: number;
  tenure_days?: number;
  tier_config: string[];
  consent_token?: string;
}

export interface ScoreResponse {
  score: number;
  confidence_interval: { lower: number; upper: number };
  confidence_band: 'HIGH' | 'MEDIUM' | 'LOW';
  data_coverage_pct: number;
  positive_factors: string[];
  negative_factors: string[];
  model_version: string;
  consent_token_ref: string;
  trace_id: string;
  computed_at: string;
}

export interface ScoreHistoryResponse {
  scores: { date: string; score: number; confidence_band: string }[];
  borrower_id: string;
}

export interface OutcomeRequest {
  loan_id: string;
  borrower_bvn: string;
  outcome: 'REPAID_ON_TIME' | 'REPAID_LATE' | 'DEFAULTED' | 'RESTRUCTURED' | 'WRITTEN_OFF';
  outcome_date: string;
  disbursement_date: string;
  due_date: string;
  score_at_origination: number;
  amount: number;
}

export interface OutcomeRecord {
  id: string;
  loan_id: string;
  borrower_bvn_hash: string;
  lender_id: string;
  outcome: string;
  outcome_date: string;
  disbursement_date: string;
  due_date: string;
  loan_amount_ngn: number;
  score_at_origination: number;
  submitted_at: string;
}

// ─── Human Review types (PRD US-015, NDPA Section 34) ───────────────────────
export interface ReviewRequest {
  bvn: string;
  loan_id: string;
  reason: string;
  score_at_decision: number;
  decision_outcome: string;
}

export interface ReviewResponse {
  review_id: string;
  status: string;
  sla_deadline: string;
  message: string;
}

export interface ReviewEntry {
  review_id: string;
  borrower_bvn_hash: string;
  loan_id: string;
  score_at_decision: number;
  decision_outcome: string;
  reason: string;
  status: 'pending' | 'in_review' | 'completed' | 'cancelled';
  outcome?: string;
  reviewer_notes?: string;
  created_at: string;
  sla_deadline: string;
  completed_at?: string;
}

// ─── Batch Scoring types (PRD US-005) ────────────────────────
export interface BatchScoreEntry {
  bvn: string;
  phone: string;
  tier_config: string[];
  external_ref?: string;
}

export interface BatchScoreResultEntry {
  external_ref?: string;
  score?: number;
  confidence_band?: string;
  data_coverage_pct?: number;
  error?: string;
}

export interface BatchScoreJob {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  total_entries: number;
  completed_entries: number;
  failed_entries: number;
  results: BatchScoreResultEntry[] | null;
  created_at: string;
  completed_at: string | null;
  estimated_completion_seconds?: number;
}

// ─── Borrower Explanation types (PRD FR-014) ────────────────
export interface BorrowerExplanation {
  score: number;
  confidence_band: string;
  data_coverage_pct: number;
  model_version: string;
  positive_factors: string[];
  negative_factors: string[];
  actionable_tips: string[];
  scored_at: string;
}

// ─── Data Subject Access Request (DSAR) types (PRD FR-017) ──
export interface DataSubjectData {
  bvn_hash: string;
  profile: Record<string, unknown>;
  consent_records: Record<string, unknown>[];
  feature_summary: Record<string, unknown>[];
  score_history: Record<string, unknown>[];
  compiled_at: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  key_prefix: string;
  environment: 'sandbox' | 'production';
  created_at: string;
  last_used: string | null;
  is_active: boolean;
  ip_allowlist: string[];
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered: string | null;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  status_code: number;
  status: 'success' | 'failed' | 'pending';
  attempted_at: string;
  response_body: string | null;
}

export interface UsageStats {
  total_calls_today: number;
  avg_score: number;
  high_confidence_pct: number;
  api_credits_remaining: number;
  monthly_calls: number;
  monthly_spend: number;
  rate_limit_headroom: number;
  plan: string;
}
