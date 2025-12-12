"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { Alert } from "@/components/ui/Alert";

export default function RegisterPage() {
  const router = useRouter();
  const { status, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  return (
    <div className="card">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Create account</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Register to access the dashboard.</p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <form
        className="mt-4 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            await register({ name: name.trim() || undefined, email: email.trim(), password });
            router.replace("/dashboard");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="space-y-1">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="input"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
