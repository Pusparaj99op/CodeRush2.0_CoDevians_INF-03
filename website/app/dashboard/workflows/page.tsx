"use client";

// Full workflow history for the signed-in user, via GET /api/workflows?userId=.
// This is the "access the whole app from the website" surface: every run,
// not just the one active in the Overview tab.

import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import type { Workflow, WorkflowStatus } from "@/lib/types";

const STATUS_STYLE: Record<WorkflowStatus, string> = {
  planning: "text-[var(--color-muted)]",
  running: "text-[var(--color-accent)]",
  completed: "text-emerald-400",
  cancelled: "text-red-400",
  failed: "text-red-400",
};

export default function WorkflowsPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch(`/api/workflows?userId=${encodeURIComponent(user.uid)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error ?? "could not load workflows");
          return;
        }
        setWorkflows(body.workflows);
      })
      .catch((err) => !cancelled && setError((err as Error).message));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <DashboardShell>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
        Workflows
      </h1>
      <p className="mt-2 text-sm text-[var(--color-body)]">
        Every goal you&apos;ve given Veldar, with its current status and spend.
      </p>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && !workflows && (
        <ul className="mt-8 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
            />
          ))}
        </ul>
      )}

      {workflows && workflows.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            No workflows yet. Start one from the Overview tab.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
          >
            Go to Overview
          </Link>
        </div>
      )}

      {workflows && workflows.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3">
          {workflows.map((wf) => (
            <li key={wf.id}>
              <Link
                href={`/trace/${wf.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-colors hover:border-[var(--color-headline)]/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-headline)]">{wf.goal}</p>
                  <p className="mt-1 text-xs text-[var(--color-footer-dim)]">
                    {new Date(wf.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {wf.spentAlgo} / {wf.budgetAlgo} ALGO
                  </span>
                  <span className={`text-xs font-medium ${STATUS_STYLE[wf.status]}`}>{wf.status}</span>
                  <ArrowUpRight size={16} className="text-[var(--color-muted)]" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
