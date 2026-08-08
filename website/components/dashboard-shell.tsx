"use client";

// Shared authenticated shell for every /dashboard/* page: sign-in gate,
// error surfacing for the Google auth flow, and the tab bar that makes
// the full product reachable from the website (goal runner, workflow
// history, account/tier settings) rather than a single demo page.

import { Gauge, GearSix, Lightning, ListChecks, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";
import { X402InspectorModal } from "@/components/x402-inspector-modal";
import SpecularButton from "@/components/SpecularButton";

const TABS = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/workflows", label: "Workflows", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: GearSix },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, clearAuthError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

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
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-8 lg:pt-28">
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

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
          <nav className="relative z-10 flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1.5 shadow-sm">
            {TABS.map((tab) => {
              const isOverview = tab.href === "/dashboard";
              const active = isOverview
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname === tab.href || (pathname?.startsWith(`${tab.href}/`) ?? false);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    active
                      ? "btn-spectacular flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                      : "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[var(--color-body)] transition-colors hover:text-[var(--color-headline)]"
                  }
                >
                  <Icon size={15} weight={active ? "fill" : "regular"} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <SpecularButton
              onClick={() => setIsInspectorOpen(true)}
              size="sm"
              radius={9999}
              tint="#ff5228"
              tintOpacity={0.15}
              lineColor="#ff7a59"
              baseColor="#ff5228"
              autoAnimate={true}
            >
              <Lightning size={14} weight="bold" />
              <span>Inspect x402 Engine (Judge Demo)</span>
            </SpecularButton>

            <a
              href="https://dispenser.testnet.aws.algorand.network/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              <span>Get Free TestNet ALGO</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-200">Faucet</span>
            </a>

            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 font-inter">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Session ({user.email?.slice(0, 14)}...)</span>
            </div>
          </div>
        </div>

        {children}

        {/* Judge Demo x402 Payment Engine Inspector Modal */}
        <X402InspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          walletAddress={user.uid}
        />
      </main>
    </>
  );
}

