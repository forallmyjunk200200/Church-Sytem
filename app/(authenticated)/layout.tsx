"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/auth/useAuth";
import { Spinner } from "@/components/ui/Spinner";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto flex min-h-dvh max-w-6xl items-center px-4">
          <Spinner label="Loading session" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
