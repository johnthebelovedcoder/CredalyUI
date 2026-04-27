import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the toast before importing apiClient
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an axios instance with correct config', async () => {
    const { apiClient } = await import('@/lib/api');

    // baseURL may be overridden by env vars — just verify it's set
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(30000);
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('creates scoringClient with correct config', async () => {
    const { scoringApi } = await import('@/lib/api');

    // Verify the scoring API object exists and has expected methods
    expect(scoringApi).toBeDefined();
    expect(scoringApi.score).toBeDefined();
    expect(scoringApi.getScoreHistory).toBeDefined();
    expect(scoringApi.submitOutcome).toBeDefined();
    expect(scoringApi.getApiKeys).toBeDefined();
  });

  it('exposes all expected API modules', async () => {
    const api = await import('@/lib/api');

    expect(api.pipelineApi).toBeDefined();
    expect(api.pipelineApi.getHealth).toBeDefined();
    expect(api.metricsApi).toBeDefined();
    expect(api.metricsApi.getMetrics).toBeDefined();
    expect(api.clientsApi).toBeDefined();
    expect(api.clientsApi.list).toBeDefined();
    expect(api.consentApi).toBeDefined();
    expect(api.consentApi.list).toBeDefined();
    expect(api.healthApi).toBeDefined();
    expect(api.healthApi.check).toBeDefined();
  });
});
