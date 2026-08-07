"use client";

// Shared sign-in / sign-up form. One component for both modes because the
// two differ only in a name field, the submit handler, and the copy —
// keeping them together stops the two pages from drifting apart.

import { SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { GoogleButton } from "./google-button";

const MIN_PASSWORD_LENGTH = 6;

/** Only lets the user back into our own app — never an absolute URL. */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const {
    user,
    loading,
    configured,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in (or just finished a redirect sign-in) — move along.
  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) return setLocalError("Enter your email address.");
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    setSubmitting(true);
    const ok = isSignUp
      ? await signUpWithEmail(email.trim(), password, name)
      : await signInWithEmail(email.trim(), password);
    setSubmitting(false);

    if (ok) router.replace(next);
  }

  const error = localError ?? authError;
  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]";

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-headline)]">
        {isSignUp ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-body)]">
        {isSignUp
          ? "Run agent workflows and watch every offer, approval, and receipt."
          : "Sign in to your dashboard and workflow traces."}
      </p>

      {user && (
        <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--color-muted)]">Signed in as</p>
              <p className="truncate text-sm font-semibold text-[var(--color-headline)]">
                {user.displayName || user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
            >
              <SignOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <GoogleButton
          onClick={signInWithGoogle}
          label={isSignUp ? "Sign up with Google" : "Continue with Google"}
        />
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">or</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-medium text-[var(--color-body)]">
              Name <span className="text-[var(--color-muted)]">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ada Lovelace"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-medium text-[var(--color-body)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium text-[var(--color-body)]">
              Password
            </label>
            {!isSignUp && (
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-headline)]"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : "••••••••"}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-spectacular mt-2 w-full py-3.5 text-sm font-semibold shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Working…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-body)]">
        {isSignUp ? "Already have an account? " : "New to Veldar? "}
        <Link
          href={isSignUp ? `/signin?next=${encodeURIComponent(next)}` : `/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-[var(--color-accent)] hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
