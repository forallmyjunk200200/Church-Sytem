"use client";

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

async function postAttendance(action: "check-in" | "check-out", memberId?: string) {
  const path = action === "check-in" ? "/attendance/check-in" : "/attendance/check-out";

  return apiFetch(path, {
    auth: true,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberId ? { member_id: memberId } : {}),
  });
}

export default function AttendancePage() {
  const { user } = useAuth();
  const manager = isManagerRole(user?.role);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  useEffect(() => {
    if (!manager) return;

    let mounted = true;
    setLoadingMembers(true);

    void (async () => {
      try {
        const data = await apiFetch<unknown>("/members", { auth: true });
        const list =
          Array.isArray(data) ? data : isRecord(data) && Array.isArray(data.items) ? data.items : [];
        const normalized = list.map(normalizeMember);
        if (mounted) setMembers(normalized);
      } catch {
        if (mounted) setMembers([]);
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [manager]);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) ?? null,
    [members, selectedMemberId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Attendance</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Log check-in and check-out events.</p>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Your attendance</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">These actions log attendance for the current session user.</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={async () => {
                setError(null);
                setNotice(null);
                setSaving(true);
                try {
                  await postAttendance("check-in");
                  setNotice("Checked in.");
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Check-in failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Check in
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={async () => {
                setError(null);
                setNotice(null);
                setSaving(true);
                try {
                  await postAttendance("check-out");
                  setNotice("Checked out.");
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Check-out failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Check out
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">Signed in as: {user?.email}</div>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Manage attendance</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {manager
              ? "Staff/pastor view: log attendance for any member."
              : "Members/guests can only log their own attendance."}
          </p>

          {!manager ? null : loadingMembers ? (
            <div className="mt-4">
              <Spinner label="Loading members" />
            </div>
          ) : members.length === 0 ? (
            <div className="mt-4">
              <Alert variant="info">No members loaded.</Alert>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="label" htmlFor="member">
                  Select member
                </label>
                <select
                  id="member"
                  className="input"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">Choose…</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.email ? ` (${m.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving || !selectedMember}
                  onClick={async () => {
                    if (!selectedMember) return;
                    setError(null);
                    setNotice(null);
                    setSaving(true);
                    try {
                      await postAttendance("check-in", selectedMember.id);
                      setNotice(`Checked in ${selectedMember.name}.`);
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : "Check-in failed");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Check in
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saving || !selectedMember}
                  onClick={async () => {
                    if (!selectedMember) return;
                    setError(null);
                    setNotice(null);
                    setSaving(true);
                    try {
                      await postAttendance("check-out", selectedMember.id);
                      setNotice(`Checked out ${selectedMember.name}.`);
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : "Check-out failed");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Check out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
