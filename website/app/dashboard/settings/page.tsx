"use client";

// Account settings: profile, default subscription tier (Doc/specs/00-overview.md
// tier table), and sign-out. Default tier is a client-side preference for
// this hackathon build (would move to Firestore alongside the App's user
// record in a real deployment, per Doc/specs/01-app.md's data model).

import { SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import type { Tier } from "@/lib/types";

const TIER_LABELS: Record<Tier, string> = { free: "Free", pro: "Pro", promax: "ProMax" };
const DEFAULT_TIER_KEY = "veldar:default-tier";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [defaultTier, setDefaultTier] = useState<Tier>("free");

  useEffect(() => {
    const stored = window.localStorage.getItem(DEFAULT_TIER_KEY) as Tier | null;
    if (stored) setDefaultTier(stored);
  }, []);

  function updateTier(tier: Tier) {
    setDefaultTier(tier);
    window.localStorage.setItem(DEFAULT_TIER_KEY, tier);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <DashboardShell>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
        Settings
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-headline)]">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
                {user?.displayName?.[0] ?? "V"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[var(--color-headline)]">{user?.displayName}</p>
              <p className="text-xs text-[var(--color-muted)]">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-headline)] transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <SignOut size={16} />
            Sign out
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-headline)]">Default tier</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Used to pre-fill new workflows. Change it per workflow from the Overview tab.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {(Object.keys(TIER_LABELS) as Tier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => updateTier(tier)}
                className={
                  defaultTier === tier
                    ? "flex items-center justify-between rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-4 py-3 text-sm font-medium text-[var(--color-headline)]"
                    : "flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-body)] transition-colors hover:border-[var(--color-headline)]/30"
                }
              >
                {TIER_LABELS[tier]}
                {defaultTier === tier && <span className="text-xs text-[var(--color-accent)]">Active</span>}
              </button>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
