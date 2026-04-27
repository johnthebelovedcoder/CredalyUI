import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineApi, metricsApi, clientsApi, consentApi, healthApi, scoringApi } from '@/lib/api';
import type {
  PipelineHealth,
  PipelineHistoryEntry,
  PipelineUptime,
  ModelMetrics,
  PSIAlert,
  ScoreDistribution,
  RetrainJob,
  Client,
  CreateClientInput,
  CreateClientResponse,
  RotateKeyResponse,
  ConsentEntry,
  ConsentVerification,
  ConsentQueryParams,
  HealthCheck,
  ScoreRequest,
  ScoreResponse,
  ScoreHistoryResponse,
  OutcomeRequest,
  ApiKeyInfo,
  WebhookEndpoint,
  WebhookDelivery,
  ReviewRequest,
  ReviewResponse,
  ReviewEntry,
  BatchScoreEntry,
  BatchScoreJob,
  BorrowerExplanation,
  DataSubjectData,
} from '@/lib/types';

// Pipeline hooks
export function usePipelineHealth() {
  return useQuery({
    queryKey: ['pipeline-health'],
    queryFn: async () => {
      const { data } = await pipelineApi.getHealth();
      return data as PipelineHealth[];
    },
    refetchInterval: 30000,
  });
}

export function usePipelineHistory(source: string, enabled = true) {
  return useQuery({
    queryKey: ['pipeline-history', source],
    queryFn: async () => {
      const { data } = await pipelineApi.getSourceHistory(source);
      return data as { data: PipelineHistoryEntry[]; total: number };
    },
    enabled: enabled && !!source,
  });
}

export function usePipelineUptime(hours = 24) {
  return useQuery({
    queryKey: ['pipeline-uptime', hours],
    queryFn: async () => {
      const { data } = await pipelineApi.getUptime(hours);
      return data as PipelineUptime;
    },
    refetchInterval: 60000,
  });
}

// Metrics hooks
export function useModelMetrics() {
  return useQuery({
    queryKey: ['model-metrics'],
    queryFn: async () => {
      const { data } = await metricsApi.getMetrics();
      return data as ModelMetrics;
    },
    refetchInterval: 60000,
  });
}

export function usePSIAlerts() {
  return useQuery({
    queryKey: ['psi-alerts'],
    queryFn: async () => {
      const { data } = await metricsApi.getPSIAlerts();
      return data as PSIAlert[];
    },
  });
}

export function useScoreDistribution() {
  return useQuery({
    queryKey: ['score-distribution'],
    queryFn: async () => {
      const { data } = await metricsApi.getScoreDistribution();
      return data as ScoreDistribution;
    },
  });
}

export function useRetrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await metricsApi.triggerRetrain();
      return data as RetrainJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-metrics'] });
    },
  });
}

// Client hooks
export function useClients(status?: string) {
  return useQuery({
    queryKey: ['clients', status],
    queryFn: async () => {
      const { data } = await clientsApi.list(status);
      return data as Client[];
    },
  });
}

export function useClient(id: string, enabled = true) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data } = await clientsApi.getOne(id);
      return data as Client;
    },
    enabled: enabled && !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const { data } = await clientsApi.create({
        name: input.name,
        environment: input.environment,
        tier_access: input.tier_access,
        rate_limit: input.rate_limit,
      });
      return data as CreateClientResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useSuspendClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientsApi.suspend(id);
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useTerminateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientsApi.terminate(id);
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useReactivateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientsApi.reactivate(id);
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useRotateClientKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await clientsApi.rotateKey(id);
      return data as RotateKeyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Consent hooks
export function useConsentList(params: ConsentQueryParams) {
  return useQuery({
    queryKey: ['consent', params],
    queryFn: async () => {
      const { data } = await consentApi.list(params);
      return data as { data: ConsentEntry[]; total: number };
    },
  });
}

export function useVerifyConsent(consentId: string, enabled = true) {
  return useQuery({
    queryKey: ['consent-verify', consentId],
    queryFn: async () => {
      const { data } = await consentApi.verify(consentId);
      return data as ConsentVerification;
    },
    enabled: enabled && !!consentId,
  });
}

export function useVerifyConsentMutation() {
  return useMutation({
    mutationFn: async (consentId: string) => {
      const { data } = await consentApi.verify(consentId);
      return data as ConsentVerification;
    },
  });
}

// Health hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await healthApi.check();
      return data as HealthCheck;
    },
    refetchInterval: 30000,
  });
}

// ─── Scoring API hooks (partner portal) ────────────────────────
export function useScoreBorrower() {
  return useMutation({
    mutationFn: async (input: ScoreRequest) => {
      const { data } = await scoringApi.score(input);
      return data as ScoreResponse;
    },
  });
}

export function useScoreHistory(bvn: string, enabled = true) {
  return useQuery({
    queryKey: ['score-history', bvn],
    queryFn: async () => {
      const { data } = await scoringApi.getScoreHistory(bvn);
      return data as ScoreHistoryResponse;
    },
    enabled: enabled && !!bvn,
  });
}

export function useSubmitOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OutcomeRequest) => {
      const { data } = await scoringApi.submitOutcome(input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outcomes'] });
    },
  });
}

export function useOutcomes(params?: Record<string, string | number>) {
  return useQuery({
    queryKey: ['outcomes', params],
    queryFn: async () => {
      const { data } = await scoringApi.getOutcomes(params);
      return data;
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await scoringApi.getApiKeys();
      return data as ApiKeyInfo[];
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; environment: string }) => {
      const { data } = await scoringApi.createApiKey(input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useRotateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await scoringApi.rotateApiKey(id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await scoringApi.revokeApiKey(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data } = await scoringApi.getWebhooks();
      return data as WebhookEndpoint[];
    },
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { url: string; events: string[] }) => {
      const { data } = await scoringApi.createWebhook(input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await scoringApi.deleteWebhook(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await scoringApi.testWebhook(id);
      return data;
    },
  });
}

export function useWebhookDeliveries(webhookId: string, enabled = true) {
  return useQuery({
    queryKey: ['webhook-deliveries', webhookId],
    queryFn: async () => {
      const { data } = await scoringApi.getWebhookDeliveries(webhookId);
      return data as WebhookDelivery[];
    },
    enabled: enabled && !!webhookId,
  });
}

export function useReplayWebhookDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deliveryId: string) => {
      const { data } = await scoringApi.replayWebhook(deliveryId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
    },
  });
}

// ─── Human Review hooks (PRD US-015, NDPA Section 34) ────────────────
export function useRequestReview() {
  return useMutation({
    mutationFn: async (input: ReviewRequest) => {
      const { data } = await scoringApi.requestReview(input);
      return data as ReviewResponse;
    },
  });
}

export function useReviews(lenderId?: string) {
  return useQuery({
    queryKey: ['reviews', lenderId],
    queryFn: async () => {
      const { data } = await scoringApi.listReviews(lenderId);
      return data as ReviewEntry[];
    },
  });
}

export function useReview(reviewId: string, enabled = true) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const { data } = await scoringApi.getReview(reviewId);
      return data as ReviewEntry;
    },
    enabled: enabled && !!reviewId,
  });
}

export function useCompleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { reviewId: string; outcome: string; reviewer_notes?: string }) => {
      const { data } = await scoringApi.completeReview(input.reviewId, {
        outcome: input.outcome,
        reviewer_notes: input.reviewer_notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// ─── Batch Scoring hooks (PRD US-005) ────────────────────────────────
export function useSubmitBatchScore() {
  return useMutation({
    mutationFn: async (entries: BatchScoreEntry[]) => {
      const { data } = await scoringApi.submitBatchScore(entries);
      return data as BatchScoreJob;
    },
  });
}

export function useBatchScoreJob(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['batch-score-job', jobId],
    queryFn: async () => {
      const { data } = await scoringApi.getBatchScoreJob(jobId);
      return data as BatchScoreJob;
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Poll every 5s while job is processing
      const state = query.state.data;
      if (state?.status === 'processing') return 5000;
      return false;
    },
  });
}

// ─── Borrower Explanation hook (PRD FR-014) ──────────────────────────
export function useBorrowerExplanation(bvn: string, enabled = true) {
  return useQuery({
    queryKey: ['borrower-explanation', bvn],
    queryFn: async () => {
      const { data } = await scoringApi.getBorrowerExplanation(bvn);
      return data as BorrowerExplanation;
    },
    enabled: enabled && !!bvn,
  });
}

// ─── Data Subject Access Request hook (PRD FR-017) ───────────────────
export function useSubjectData(bvn: string, enabled = true) {
  return useQuery({
    queryKey: ['subject-data', bvn],
    queryFn: async () => {
      const { data } = await scoringApi.getSubjectData(bvn);
      return data as DataSubjectData;
    },
    enabled: enabled && !!bvn,
  });
}
