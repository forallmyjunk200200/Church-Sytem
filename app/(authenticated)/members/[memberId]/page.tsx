"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const ROLE_OPTIONS: Role[] = ["guest", "member", "staff", "pastor"];

export default function MemberDetailPage({ params }: { params: { memberId: string } }) {
  const router = useRouter();
  const memberId = params.memberId;

  const { user } = useAuth();
  const manager = isManagerRole(user?.role);

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await apiFetch<unknown>(`/members/${memberId}`, { auth: true });
        const normalized = normalizeMember(data);
        if (mounted) setMember(normalized);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load member";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [memberId]);

  const roleValue = useMemo(() => member?.role ?? "member", [member?.role]);

  if (loading) return <Spinner label="Loading member" />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!member) return <Alert variant="info">Member not found.</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{member.name}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{member.email ?? "—"}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          Back
        </button>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Directory details</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Member ID</div>
              <div className="mt-1 break-all text-sm text-slate-900 dark:text-slate-50">{member.id}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</div>
              <div className="mt-1 text-sm text-slate-900 dark:text-slate-50">{roleValue}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Actions</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {manager ? "Staff view: management controls enabled." : "Read-only view."}
          </p>

          {manager ? (
            <form
              className="mt-4 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setNotice(null);
                setError(null);
                setSaving(true);

                try {
                  const form = new FormData(e.currentTarget);
                  const roleRaw = String(form.get("role") ?? "");

                  const nextRole = ROLE_OPTIONS.includes(roleRaw as Role)
                    ? (roleRaw as Role)
                    : null;

                  if (!nextRole) {
                    throw new Error("Invalid role");
                  }

                  await apiFetch(`/members/${member.id}`, {
                    auth: true,
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: nextRole }),
                  });

                  setMember((prev) => (prev ? { ...prev, role: nextRole } : prev));
                  setNotice("Role updated.");
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Failed to update role");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {error ? <Alert variant="error">{error}</Alert> : null}

              <div className="space-y-1">
                <label className="label" htmlFor="role">
                  Set role
                </label>
                <select id="role" name="role" defaultValue={roleValue} className="input">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary w-full" disabled={saving} type="submit">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
