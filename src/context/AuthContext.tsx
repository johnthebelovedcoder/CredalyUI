"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api";
import { setSentryUser, clearSentryUser } from "@/lib/sentry";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "admin" | "partner" | "analyst" | "ops";
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session metadata stored in sessionStorage (not tokens — tokens are in httpOnly cookies)
const SESSION_META_KEY = "credaly_session_meta";

interface SessionMeta {
  userId: string;
  loginAt: string;
}

/** Store session metadata for UX purposes */
function storeSessionMeta(meta: SessionMeta): void {
  try {
    sessionStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
  } catch {
    // sessionStorage may be disabled — ignore
  }
}

function getSessionMeta(): SessionMeta | null {
  try {
    const raw = sessionStorage.getItem(SESSION_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSessionMeta(): void {
  try {
    sessionStorage.removeItem(SESSION_META_KEY);
  } catch {
    // ignore
  }
}

/** Store auth tokens in sessionStorage for API interceptor use */
function storeAuthTokens(tokens: { accessToken: string; refreshToken: string; expiresIn: number }): void {
  try {
    sessionStorage.setItem(
      "credaly_auth_token",
      JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresIn * 1000,
      })
    );
  } catch {
    // ignore
  }
}

function getAuthTokens(): { accessToken: string; refreshToken: string; expiresAt: number } | null {
  try {
    const raw = sessionStorage.getItem("credaly_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearAuthTokens(): void {
  try {
    sessionStorage.removeItem("credaly_auth_token");
  } catch {
    // ignore
  }
}

/** Whether to use real backend auth or mock (for development) */
const USE_REAL_AUTH = import.meta.env.VITE_ENVIRONMENT !== "DEVELOPMENT";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Restore session on mount by validating with the backend.
   */
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const meta = getSessionMeta();
      const tokens = getAuthTokens();

      if (!meta || !tokens) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (Date.now() >= tokens.expiresAt) {
        clearSessionMeta();
        clearAuthTokens();
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        if (USE_REAL_AUTH) {
          // Validate session with backend
          const response = await apiClient.get<User>("/auth/me", {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });
          if (!cancelled) {
            setUser(response.data);
            setSentryUser(response.data.id, response.data.email);
          }
        } else {
          // Mock: restore from metadata
          if (!cancelled) {
            const mockUser: User = {
              id: meta.userId,
              email: meta.userId,
              name: meta.userId.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              firstName: meta.userId.split("@")[0],
              lastName: "",
              role: meta.userId.includes("admin") ? "admin" : "partner",
            };
            setUser(mockUser);
          }
        }
      } catch {
        // Session invalid — clear metadata
        clearSessionMeta();
        clearAuthTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  /** Schedule automatic token refresh before expiry */
  const scheduleRefresh = useCallback((expiresAt: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const timeUntilExpiry = expiresAt - Date.now();
    const refreshIn = Math.max(0, timeUntilExpiry - 60_000); // Refresh 1 min before expiry

    refreshTimerRef.current = setTimeout(async () => {
      await refreshSession();
    }, refreshIn);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      if (USE_REAL_AUTH) {
        // Call real backend auth endpoint
        const response = await apiClient.post<AuthTokens>("/auth/login", {
          email,
          password,
        });

        const { accessToken, refreshToken, expiresIn, user: backendUser } = response.data;

        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          name: `${backendUser.firstName} ${backendUser.lastName}`.trim() || backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          role: backendUser.role as User["role"],
        };

        setUser(mappedUser);
        storeAuthTokens({ accessToken, refreshToken, expiresIn });
        storeSessionMeta({ userId: mappedUser.id, loginAt: new Date().toISOString() });
        setSentryUser(mappedUser.id, mappedUser.email);

        const expiresAt = Date.now() + expiresIn * 1000;
        scheduleRefresh(expiresAt);
      } else {
        // Mock implementation for development
        await new Promise((resolve) => setTimeout(resolve, 600));

        const mockUser: User = {
          id: email,
          email,
          name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          firstName: email.split("@")[0],
          lastName: "",
          role: email.includes("admin") ? "admin" : "partner",
        };

        setUser(mockUser);
        storeSessionMeta({ userId: email, loginAt: new Date().toISOString() });
        // Mock expiry: 15 minutes from now
        const mockExpiry = Date.now() + 15 * 60 * 1000;
        scheduleRefresh(mockExpiry);
      }
    } catch (error) {
      clearSessionMeta();
      clearAuthTokens();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const tokens = getAuthTokens();

    try {
      if (USE_REAL_AUTH && tokens) {
        // Call backend logout endpoint to invalidate refresh token
        await apiClient.post(
          "/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
        );
      }
    } catch {
      // Always clear local state even if backend call fails
    } finally {
      setUser(null);
      clearSessionMeta();
      clearAuthTokens();
      clearSentryUser();
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const tokens = getAuthTokens();
      if (!tokens) return false;

      if (USE_REAL_AUTH) {
        const response = await apiClient.post<{ accessToken: string; expiresIn: number }>(
          "/auth/refresh",
          { refreshToken: tokens.refreshToken }
        );

        const { accessToken, expiresIn } = response.data;
        storeAuthTokens({ accessToken, refreshToken: tokens.refreshToken, expiresIn });

        const newExpiresAt = Date.now() + expiresIn * 1000;
        scheduleRefresh(newExpiresAt);
        return true;
      } else {
        // Mock: extend session by another 15 minutes
        const newExpiry = Date.now() + 15 * 60 * 1000;
        scheduleRefresh(newExpiry);
        return true;
      }
    } catch {
      // Refresh failed — session is invalid
      setUser(null);
      clearSessionMeta();
      clearAuthTokens();
      clearSentryUser();
      return false;
    }
  }, [scheduleRefresh]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
