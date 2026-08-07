"use client";

// Dedicated trace viewer, per Doc/specs/02-website.md ("Trace viewer: a
// dedicated page rendering a workflow's full replayable trace"). Renders
// every ledger event for one workflow in order, straight from the
// orchestrator's existing GET /api/workflows/:id/trace endpoint.

import {
  ArrowLeft,
  CheckCircle,
  Coins,
  FileText,
  Hourglass,
  ShieldCheck,
  XCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import type { LedgerEvent, LedgerEventType } from "@/lib/types";

const EVENT_META: Partial<Record<LedgerEventType, { icon: typeof FileText; text: string }>> = {
  offer_seen: { icon: FileText, text: "text-[var(--color-muted)]" },
  quote_received: { icon: Coins, text: "text-[var(--color-cta)]" },
  approval_requested: { icon: Hourglass, text: "text-[var(--color-accent)]" },
  approval_decided: { icon: CheckCircle, text: "text-[var(--color-accent)]" },
  payment_verified: { icon: ShieldCheck, text: "text-[var(--color-cta)]" },
  payment_settled: { icon: Coins, text: "text-[var(--color-cta)]" },
  fulfillment_verified: { icon: CheckCircle, text: "text-emerald-400" },
  step_failed: { icon: XCircle, text: "text-red-400" },
  workflow_cancelled: { icon: XCircle, text: "text-red-400" },
  workflow_completed: { icon: CheckCircle, text: "text-emerald-400" },
};

export default function TraceViewer({ params }: { params: { id: string } }) {
  const [trace, setTrace] = useState<LedgerEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/workflows/${params.id}/trace`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error ?? "could not load trace");
          return;
        }
        setTrace(body.trace);
      })
      .catch((err) => !cancelled && setError((err as Error).message));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-headline)]"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
          Workflow trace
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--color-footer-dim)]">{params.id}</p>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-300">
            {error}
          </div>
        )}

        {!error && !trace && (
          <ul className="mt-8 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-16 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]" />
            ))}
          </ul>
        )}

        {trace && trace.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted)]">
            No events recorded for this workflow yet.
          </div>
        )}

        {trace && trace.length > 0 && (
          <ol className="mt-8 flex flex-col gap-2 border-l border-[var(--color-border)] pl-6">
            {trace.map((event) => {
              const meta = EVENT_META[event.type] ?? { icon: FileText, text: "text-[var(--color-muted)]" };
              const Icon = meta.icon;
              return (
                <li key={event.id} className="relative pb-4">
                  <span className="absolute -left-[29px] top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--color-bg)]">
                    <Icon size={14} weight="fill" className={meta.text} />
                  </span>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--color-headline)]">
                        {event.type.replace(/_/g, " ")}
                      </p>
                      <time className="font-mono text-[11px] text-[var(--color-footer-dim)]">
                        {new Date(event.at).toLocaleTimeString()}
                      </time>
                    </div>
                    {Object.keys(event.detail).length > 0 && (
                      <pre className="mt-2 overflow-x-auto text-[11px] leading-relaxed text-[var(--color-muted)]">
                        {JSON.stringify(event.detail, null, 2)}
                      </pre>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}
