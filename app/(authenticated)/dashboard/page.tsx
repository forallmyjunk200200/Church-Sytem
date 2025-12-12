"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { isManagerRole } from "@/lib/roles";

export default function DashboardPage() {
  const { user } = useAuth();
  const manager = isManagerRole(user?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Signed in as <span className="font-medium">{user?.email}</span> ({user?.role}).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Members</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Browse the member directory.</p>
          <Link href="/members" className="btn btn-secondary mt-4 inline-flex">
            Open directory
          </Link>
        </div>

        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Attendance</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Check in / check out.</p>
          <Link href="/attendance" className="btn btn-secondary mt-4 inline-flex">
            Log attendance
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Access</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {manager
                ? "You have staff permissions. Management actions are enabled."
                : "You have read-only access to directory data."}
            </div>
          </div>
          <Link href="/profile" className="btn btn-primary">
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
