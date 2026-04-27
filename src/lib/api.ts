import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { executeWithRetry } from './retry';

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:3001';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Send httpOnly cookies for session-based auth
});

// Request interceptor: attach JWT if available (fallback to cookie auth)
apiClient.interceptors.request.use((config) => {
  // In production, tokens are in httpOnly cookies — no manual header needed
  // During transition, support manual JWT from sessionStorage if present
  try {
    const raw = sessionStorage.getItem('credaly_auth_token');
    if (raw) {
      const { accessToken } = JSON.parse(raw);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  } catch {
    // Ignore parsing errors — rely on cookie auth
  }

  // Remove the old VITE_API_KEY approach — it exposed keys in the bundle
  // const apiKey = import.meta.env.VITE_API_KEY; // NEVER do this

  return config;
});

// Track refresh state to avoid concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error;
    const originalRequest = error.config;

    // Retry logic: retry on 502/503/504 before showing error
    if (status && [502, 503, 504].includes(status) && originalRequest) {
      const retryCount = (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount || 0;
      const maxRetries = 2;

      if (retryCount < maxRetries) {
        (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1;
        const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 500, 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    if (status === 401) {
      // Session expired — attempt refresh
      if (originalRequest && !originalRequest.url?.includes('/auth/')) {
        if (isRefreshing) {
          // Queue this request until refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          // TODO: Replace with real refresh endpoint
          // await apiClient.post('/admin/auth/refresh');
          // Process queued requests with new token
          processQueue(null, 'refreshed');
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear session and redirect
          processQueue(error, null);
          try {
            sessionStorage.removeItem('credaly_auth_token');
            sessionStorage.removeItem('credaly_session_meta');
          } catch { /* ignore */ }
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Auth endpoint itself failed — redirect to login
      try {
        sessionStorage.removeItem('credaly_auth_token');
        sessionStorage.removeItem('credaly_session_meta');
      } catch { /* ignore */ }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (status === 429) {
      toast.error('Rate limit exceeded. Please try again shortly.');
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      toast.error(message || 'Server error. Please try again later.');
      return Promise.reject(error);
    }

    // 4xx errors other than 401/429 — let the calling component handle
    return Promise.reject(error);
  }
);

// Pipeline endpoints
export const pipelineApi = {
  getHealth: () => apiClient.get('/pipeline/health'),
  getSourceHistory: (source: string, page = 1, limit = 20) =>
    apiClient.get(`/pipeline/${source}/history`, { params: { page, limit } }),
  getUptime: (hours = 24) => apiClient.get('/pipeline/uptime', { params: { hours } }),
};

// Model metrics endpoints
export const metricsApi = {
  getMetrics: () => apiClient.get('/metrics'),
  getPSIAlerts: () => apiClient.get('/metrics/psi-alerts'),
  getScoreDistribution: () => apiClient.get('/metrics/score-distribution'),
  triggerRetrain: () => apiClient.post('/metrics/retrain'),
};

// Client management endpoints
export const clientsApi = {
  list: (status?: string) => apiClient.get('/clients', { params: status ? { status } : {} }),
  getOne: (id: string) => apiClient.get(`/clients/${id}`),
  create: (data: { name: string; environment: string; tier_access: string[]; rate_limit: number }) =>
    apiClient.post('/clients', data),
  suspend: (id: string) => apiClient.post(`/clients/${id}/suspend`),
  terminate: (id: string) => apiClient.post(`/clients/${id}/terminate`),
  reactivate: (id: string) => apiClient.post(`/clients/${id}/reactivate`),
  rotateKey: (id: string) => apiClient.post(`/clients/${id}/rotate-key`),
};

// Consent audit endpoints
export const consentApi = {
  list: (params: Record<string, string | number | undefined>) => apiClient.get('/consent', { params }),
  verify: (consentId: string) => apiClient.get(`/consent/verify/${consentId}`),
};

// Health check
export const healthApi = {
  check: () => apiClient.get('/health'),
};

// ─── Scoring API (partner portal) ─────────────────────────────
const SCORING_BASE = import.meta.env.VITE_SCORING_API_URL || 'http://localhost:8000';

const scoringClient: AxiosInstance = axios.create({
  baseURL: SCORING_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

scoringClient.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('credaly_api_key') || import.meta.env.VITE_API_KEY;
  if (apiKey) {
    // Scoring API uses X-API-Key header, not Bearer (PRD FR-032)
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Reuse the same response interceptor logic
scoringClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Retry logic: retry on 502/503/504 before showing error
    if (status && [502, 503, 504].includes(status) && originalRequest) {
      const retryCount = (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount || 0;
      const maxRetries = 2;

      if (retryCount < maxRetries) {
        (originalRequest as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1;
        const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 500, 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return scoringClient(originalRequest);
      }
    }

    if (status === 401) {
      try { localStorage.removeItem('credaly_session'); } catch { /* ignore */ }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 429) {
      toast.error('Rate limit exceeded. Please try again shortly.');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

import type {
  ScoreRequest,
  ScoreResponse,
  ScoreHistoryResponse,
  OutcomeRequest,
  OutcomeRecord,
  ApiKeyInfo,
  WebhookEndpoint,
  WebhookDelivery,
} from './types';

export const scoringApi = {
  score: (data: ScoreRequest) =>
    scoringClient.post<ScoreResponse>('/score', data),
  getScoreHistory: (bvn: string) =>
    scoringClient.get<ScoreHistoryResponse>(`/score/${bvn}/history`),
  getBorrowerExplanation: (bvn: string) =>
    scoringClient.get(`/score/${bvn}/explanation`),
  submitOutcome: (data: OutcomeRequest) =>
    scoringClient.post('/outcomes', data),
  getOutcomes: (params?: Record<string, string | number>) =>
    scoringClient.get('/outcomes', { params }),
  getApiKeys: () =>
    scoringClient.get<ApiKeyInfo[]>('/api-keys'),
  createApiKey: (data: { name: string; environment: string }) =>
    scoringClient.post<{ key: ApiKeyInfo; rawApiKey: string }>('/api-keys', data),
  rotateApiKey: (id: string) =>
    scoringClient.post<{ key: ApiKeyInfo; rawApiKey: string }>(`/api-keys/${id}/rotate`),
  revokeApiKey: (id: string) =>
    scoringClient.delete(`/api-keys/${id}`),
  getWebhooks: () =>
    scoringClient.get<WebhookEndpoint[]>('/webhooks'),
  createWebhook: (data: { url: string; events: string[] }) =>
    scoringClient.post('/webhooks', data),
  deleteWebhook: (id: string) =>
    scoringClient.delete(`/webhooks/${id}`),
  testWebhook: (id: string) =>
    scoringClient.post(`/webhooks/${id}/test`),
  getWebhookDeliveries: (id: string) =>
    scoringClient.get<WebhookDelivery[]>(`/webhooks/${id}/deliveries`),
  replayWebhook: (deliveryId: string) =>
    scoringClient.post(`/webhooks/deliveries/${deliveryId}/replay`),
  // Human review (PRD US-015)
  requestReview: (data: { bvn: string; loan_id: string; reason: string; score_at_decision: number; decision_outcome: string }) =>
    scoringClient.post('/review', data),
  listReviews: (lenderId?: string) =>
    scoringClient.get('/review', { params: lenderId ? { lender_id: lenderId } : {} }),
  getReview: (reviewId: string) =>
    scoringClient.get(`/review/${reviewId}`),
  completeReview: (reviewId: string, data: { outcome: string; reviewer_notes?: string }) =>
    scoringClient.post(`/review/${reviewId}/complete`, data),
  // Batch scoring (PRD US-005)
  submitBatchScore: (entries: { bvn: string; phone: string; tier_config: string[]; external_ref?: string }[]) =>
    scoringClient.post('/score/batch', { entries }),
  getBatchScoreJob: (jobId: string) =>
    scoringClient.get(`/score/batch/${jobId}`),
  // Data Subject Access Request (PRD FR-017)
  getSubjectData: (bvn: string) =>
    scoringClient.get(`/subject/${bvn}/data`),
};
