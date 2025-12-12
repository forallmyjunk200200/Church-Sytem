"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { asString, asStringOrNumber, isRecord } from "@/lib/guards";
import type { Member, Role } from "@/lib/types";
import { useAuth } from "@/components/auth/useAuth";
import { isManagerRole } from "@/lib/roles";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

function asRole(value: unknown): Role | undefined {
  return value === "guest" || value === "member" || value === "staff" || value === "pastor"
    ? value
    : undefined;
}

function normalizeMember(raw: unknown): Member {
  const obj = isRecord(raw) ? raw : {};

  const id =
    asStringOrNumber(obj.id) ??
    asStringOrNumber(obj.member_id) ??
    asStringOrNumber(obj.uuid) ??
    "";

  const email = asString(obj.email);

  const name =
    asString(obj.name) ??
    asString(obj.full_name) ??
    asString(obj.display_name) ??
    email ??
    "Unknown";

  return {
    id,
    name,
    email,
    role: asRole(obj.role),
  };
}

export default function MembersPage() {
  const { user } = useAuth();
  const manager = isManagerRole(user?.role);

  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await apiFetch<unknown>("/members", { auth: true });
        const list =
          Array.isArray(data) ? data : isRecord(data) && Array.isArray(data.items) ? data.items : [];
        const normalized = list.map(normalizeMember);
        if (mounted) setMembers(normalized);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load members";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => (m.name + " " + (m.email ?? "")).toLowerCase().includes(q));
  }, [members, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Members</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Directory list and details.</p>
        </div>

        {manager ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setBanner("Management actions enabled for staff/pastors. Wire this button to your member creation endpoint.");
              window.setTimeout(() => setBanner(null), 3500);
            }}
          >
            Add member
          </button>
        ) : null}
      </div>

      {banner ? <Alert variant="info">{banner}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="card">
        <label className="label" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          className="input mt-1"
          value={query}
          placeholder="Search by name or email"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner label="Loading members" />
      ) : filtered.length === 0 ? (
        <Alert variant="info">No members found.</Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="card block hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{m.name}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.email ?? "—"}</div>
                </div>
                <div className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
                  {m.role ?? "member"}
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-50">View details →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
