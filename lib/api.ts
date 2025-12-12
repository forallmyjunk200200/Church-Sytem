import { clearStoredTokens, getStoredTokens, storeTokens } from "@/lib/authTokens";
import { getApiBaseUrl } from "@/lib/env";
import { isRecord } from "@/lib/guards";
import type { Tokens } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshInFlight: Promise<Tokens | null> | null = null;

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeTokens(raw: unknown): Tokens | null {
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

async function refreshTokens(): Promise<Tokens | null> {
  const current = getStoredTokens();
  if (!current?.refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(resolveUrl("/auth/refresh"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh_token: current.refreshToken }),
          cache: "no-store",
        });

        const data = await readJsonSafe(res);
        if (!res.ok) return null;

        const nextTokens = normalizeTokens(data);
        if (!nextTokens) return null;

        storeTokens({
          accessToken: nextTokens.accessToken,
          refreshToken: nextTokens.refreshToken ?? current.refreshToken,
        });

        return getStoredTokens();
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export type ApiFetchInit = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export async function apiFetch<T>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const { auth, retryOnUnauthorized = true, headers, ...rest } = init;

  const tokens = auth ? getStoredTokens() : null;

  const res = await fetch(resolveUrl(path), {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(headers ?? {}),
      ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    },
    cache: "no-store",
  });

  if (res.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshTokens();
    if (refreshed?.accessToken) {
      return apiFetch<T>(path, {
        ...init,
        headers: {
          ...(headers ?? {}),
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
        retryOnUnauthorized: false,
      });
    }

    clearStoredTokens();
  }

  const body = await readJsonSafe(res);

  if (!res.ok) {
    const detail = isRecord(body) ? body.detail : undefined;
    const message = (typeof detail === "string" ? detail : res.statusText) || "Request failed";

    throw new ApiError(res.status, message, body);
  }

  return body as T;
}
