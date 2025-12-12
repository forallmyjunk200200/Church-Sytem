"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { isManagerRole } from "@/lib/roles";
import { Alert } from "@/components/ui/Alert";

export default function ManagementPage() {
  const { user } = useAuth();
  const manager = isManagerRole(user?.role);

  if (!manager) {
    return <Alert variant="error">You do not have permission to view management tools.</Alert>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tools available to staff and pastors.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Member management</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create and update member records.</p>
          <Link href="/members" className="btn btn-secondary mt-4 inline-flex">
            Open members
          </Link>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">Attendance management</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Log attendance for others or audit logs.</p>
          <Link href="/attendance" className="btn btn-secondary mt-4 inline-flex">
            Open attendance
          </Link>
        </div>
      </div>
    </div>
  );
}
