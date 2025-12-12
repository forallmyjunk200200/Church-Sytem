"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { clearStoredTokens, getStoredTokens, storeTokens } from "@/lib/authTokens";
import type { AuthStatus, Tokens, User } from "@/lib/types";

type RegisterInput = {
  name?: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  reloadSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function extractTokens(raw: unknown): Tokens | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const accessToken =
    (typeof obj.access_token === "string" && obj.access_token) ||
    (typeof obj.accessToken === "string" && obj.accessToken) ||
    (typeof obj.token === "string" && obj.token) ||
    null;

  if (!accessToken) return null;

  const refreshToken =
    (typeof obj.refresh_token === "string" && obj.refresh_token) ||
    (typeof obj.refreshToken === "string" && obj.refreshToken) ||
    undefined;

  return { accessToken, refreshToken };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const reloadSession = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const me = await apiFetch<User>("/auth/me", { auth: true });
      setUser(me);
      setStatus("authenticated");
    } catch {
      clearStoredTokens();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void reloadSession();
  }, [reloadSession]);

  const login = useCallback(async (email: string, password: string) => {
    setStatus("loading");

    try {
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", password);

      const data = await apiFetch<unknown>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        retryOnUnauthorized: false,
      });

      const tokens = extractTokens(data);
      if (!tokens) {
        throw new Error("Login response did not include tokens");
      }

      storeTokens(tokens);
      await reloadSession();
    } catch (err) {
      clearStoredTokens();
      setUser(null);
      setStatus("unauthenticated");
      throw new Error(getErrorMessage(err));
    }
  }, [reloadSession]);

  const register = useCallback(async (input: RegisterInput) => {
    setStatus("loading");

    try {
      const data = await apiFetch<unknown>("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        retryOnUnauthorized: false,
      });

      const tokens = extractTokens(data);
      if (tokens) {
        storeTokens(tokens);
      }

      await reloadSession();
    } catch (err) {
      clearStoredTokens();
      setUser(null);
      setStatus("unauthenticated");
      throw new Error(getErrorMessage(err));
    }
  }, [reloadSession]);

  const logout = useCallback(() => {
    clearStoredTokens();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, reloadSession }),
    [status, user, login, register, logout, reloadSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
