"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import { NavLink } from "@/components/NavLink";
import { isManagerRole } from "@/lib/roles";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const manager = isManagerRole(user?.role);

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Auth Dashboard
            </Link>
            {manager ? (
              <div className="hidden rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900/50 dark:text-slate-200 sm:block">
                Staff view
              </div>
            ) : null}
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/members" label="Members" />
              <NavLink href="/attendance" label="Attendance" />
              {manager ? <NavLink href="/management" label="Management" /> : null}
              <NavLink href="/profile" label="Profile" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{user?.name ?? user?.email ?? ""}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              Log out
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/members" label="Members" />
          <NavLink href="/attendance" label="Attendance" />
          {manager ? <NavLink href="/management" label="Management" /> : null}
          <NavLink href="/profile" label="Profile" />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
