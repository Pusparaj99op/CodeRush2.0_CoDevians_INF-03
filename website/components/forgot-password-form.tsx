"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function ForgotPasswordForm() {
  const { sendPasswordReset, authError, clearAuthError, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearAuthError();
    setSubmitting(true);
    const ok = await sendPasswordReset(email.trim());
    setSubmitting(false);
    if (ok) setSent(true);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-headline)]">
        Reset your password
      </h1>

      {sent ? (
        <p className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm text-[var(--color-body)]">
          If an account exists for <span className="text-[var(--color-headline)]">{email}</span>,
          a reset link is on its way. Check your spam folder if it doesn&apos;t arrive.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            We&apos;ll email you a link to set a new one. Accounts created with Google don&apos;t
            have a password — use “Continue with Google” instead.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label htmlFor="email" className="text-xs font-medium text-[var(--color-body)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
            />
            {authError && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
              >
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={!configured || submitting}
              className="mt-2 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-body)]">
        <Link href="/signin" className="font-semibold text-[var(--color-accent)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
