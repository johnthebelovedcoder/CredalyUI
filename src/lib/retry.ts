import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  retries?: number;
  /** Base delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** HTTP methods to retry (default: ['GET', 'HEAD', 'OPTIONS']) */
  retryableMethods?: string[];
  /** HTTP status codes that trigger retry (default: 408, 429, 500, 502, 503, 504) */
  retryableStatuses?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  retries: 3,
  retryDelay: 1000,
  retryableMethods: ['GET', 'HEAD', 'OPTIONS'],
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate exponential backoff delay with jitter.
 * Formula: min(baseDelay * 2^attempt + randomJitter, maxDelay)
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay = 30000): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Up to 1 second of jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Check if an error is retryable.
 */
function isRetryableError(error: AxiosError, config: Required<RetryConfig>): boolean {
  // Don't retry if method is not retryable
  if (error.config?.method && !config.retryableMethods.includes(error.config.method.toUpperCase())) {
    return false;
  }

  // Don't retry network errors that are not timeouts (e.g. DNS failure)
  if (!error.response && error.code !== 'ECONNABORTED') {
    return false;
  }

  // Retry on timeout
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  // Retry on specific status codes
  if (error.response?.status && config.retryableStatuses.includes(error.response.status)) {
    return true;
  }

  return false;
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an Axios request with retry logic.
 * This is meant to be used as an Axios interceptor.
 */
export async function executeWithRetry(
  requestFn: () => Promise<AxiosResponse>,
  config: RetryConfig = {}
): Promise<AxiosResponse> {
  const { retries, retryDelay, retryableMethods, retryableStatuses } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: AxiosError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await requestFn();
      return response;
    } catch (error) {
      lastError = error as AxiosError;

      if (!isRetryableError(lastError, { retries, retryDelay, retryableMethods, retryableStatuses })) {
        throw error;
      }

      if (attempt === retries) {
        throw error;
      }

      const delay = calculateBackoff(attempt, retryDelay);
      console.warn(`[API Retry] Attempt ${attempt + 1}/${retries} failed. Retrying in ${Math.round(delay)}ms`, {
        url: lastError.config?.url,
        method: lastError.config?.method,
        status: lastError.response?.status,
      });

      await sleep(delay);
    }
  }

  // This should never be reached
  throw lastError;
}

/**
 * Create an Axios request config with an AbortController signal.
 * Use this to enable request cancellation on component unmount.
 */
export function createCancelableRequest(signal?: AbortSignal): AxiosRequestConfig {
  return {
    signal,
  };
}

/**
 * Hook-friendly wrapper that creates an AbortController and returns both
 * the signal and a cleanup function.
 */
export function useAbortController() {
  if (typeof window === 'undefined') {
    return { signal: undefined, abort: () => {} };
  }

  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}
