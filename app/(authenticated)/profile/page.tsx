"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { Alert } from "@/components/ui/Alert";

export default function ProfilePage() {
  const { user, reloadSession } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Profile</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your account details.</p>
      </div>

      {message ? <Alert variant="success">{message}</Alert> : null}

      <div className="card space-y-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</div>
          <div className="text-sm text-slate-900 dark:text-slate-50">{user?.name ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</div>
          <div className="text-sm text-slate-900 dark:text-slate-50">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</div>
          <div className="text-sm text-slate-900 dark:text-slate-50">{user?.role}</div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              await reloadSession();
              setMessage("Profile refreshed.");
              window.setTimeout(() => setMessage(null), 2500);
            }}
          >
            Refresh session
          </button>
        </div>
      </div>
    </div>
  );
}
