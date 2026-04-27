import * as Sentry from "@sentry/react";

export function initSentry() {
  // Skip Sentry in development unless explicitly enabled
  const isDev = import.meta.env.VITE_ENVIRONMENT === "DEVELOPMENT";
  const enableInDev = import.meta.env.VITE_SENTRY_ENABLE_IN_DEV === "true";

  if (isDev && !enableInDev) {
    console.log("[Sentry] Skipping initialization in development mode.");
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn("[Sentry] No DSN configured. Set VITE_SENTRY_DSN to enable error monitoring.");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_ENVIRONMENT || "production",
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.1"),
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_RATE || "0.1"),
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_RATE || "1.0"),

    // Set user context if available
    beforeSend(event) {
      // Strip any sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => {
          if (crumb.category === "fetch" || crumb.category === "xhr") {
            // Remove query params and fragments from URLs
            if (crumb.data?.url) {
              try {
                const url = new URL(crumb.data.url);
                url.search = "";
                url.hash = "";
                crumb.data.url = url.toString();
              } catch {
                // Invalid URL — leave as-is
              }
            }
          }
          return crumb;
        });
      }

      return event;
    },

    // Ignore specific errors that are not useful
    ignoreErrors: [
      // Random plugins/extensions
      /top\.GLOBALS/,
      /originalCreateNotification/,
      /canvas.contentDocument/,
      /MyApp_RemoveAllHighlights/,
      /atomicFindClose/,
      // Network errors (we handle these ourselves)
      /Network Error/,
      /Request failed/,
    ],

    // Deny URLs that are not from our app
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  });

  console.log(`[Sentry] Initialized for environment: ${import.meta.env.VITE_ENVIRONMENT || "production"}`);
}

/**
 * Set the current user for Sentry context.
 * Call this after login and clear after logout.
 */
export function setSentryUser(userId: string, email?: string): void {
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Wrap a component with Sentry ErrorBoundary.
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

export { Sentry };
