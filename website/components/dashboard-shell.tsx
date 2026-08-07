"use client";

// Shared authenticated shell for every /dashboard/* page: sign-in gate,
// error surfacing for the Google auth flow, and the tab bar that makes
// the full product reachable from the website (goal runner, workflow
// history, account/tier settings) rather than a single demo page.

import { Gauge, GearSix, ListChecks, SignIn, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/workflows", label: "Workflows", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: GearSix },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, configured, authError, signInWithGoogle, clearAuthError } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]" />
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Nav />
        <main className="mx-auto flex min-h-[60dvh] max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
            Sign in to run a workflow.
          </h1>
          <p className="mt-3 max-w-md text-sm text-[var(--color-body)]">
            {configured
              ? "Sign in with Google to submit a goal and watch Veldar's agent shop and pay for it."
              : "Firebase isn't configured yet. Add the NEXT_PUBLIC_FIREBASE_* values in .env.local (see website/README.md)."}
          </p>

          {authError && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-left text-sm text-red-300">
              <Warning size={18} className="mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={!configured}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SignIn size={18} weight="bold" />
            Sign in with Google
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {authError && (
          <div className="mb-8 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            <div className="flex items-start gap-2">
              <Warning size={18} className="mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
            <button onClick={clearAuthError} className="shrink-0 text-red-300/70 hover:text-red-200">
              Dismiss
            </button>
          </div>
        )}

        <nav className="mb-10 flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1 w-fit">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  active
                    ? "flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
                    : "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
                }
              >
                <Icon size={15} weight={active ? "fill" : "regular"} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </main>
    </>
  );
}
