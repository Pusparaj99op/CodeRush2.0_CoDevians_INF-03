"use client";

// Shared authenticated shell for every /dashboard/* page: sign-in gate,
// error surfacing for the Google auth flow, and the tab bar that makes
// the full product reachable from the website (goal runner, workflow
// history, account/tier settings) rather than a single demo page.

import { Gauge, GearSix, ListChecks, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/workflows", label: "Workflows", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: GearSix },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, clearAuthError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Send signed-out visitors to the real sign-in page rather than rendering
  // an inline gate — /signin offers both Google and email/password, and
  // `next` brings them back to the page they were actually after.
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]" />
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
