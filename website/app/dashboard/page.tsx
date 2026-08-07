"use client";

// Web dashboard: mirrors the App's live trace/approval UI (Doc/specs/01-app.md)
// and doubles as the demo surface for the hackathon walkthrough
// (Doc/specs/02-website.md). Talks directly to the orchestrator API routes
// already implemented under app/api/**.

import { ArrowUpRight, CheckCircle, SignIn } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { useAuth } from "@/lib/auth-context";
import type { LedgerEvent, Tier, Workflow } from "@/lib/types";

export default function Dashboard() {
  const { user, loading, configured, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <SkeletonCard />
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
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
          Welcome, {user.displayName ?? "there"}.
        </h1>
        <p className="mt-2 text-sm text-[var(--color-body)]">
          Submit a goal and watch the orchestrator quote, request approval, and settle each step.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          <WorkflowForm userId={user.uid} />
          <WorkflowPanel />
        </div>
      </main>
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]" />
  );
}

function WorkflowForm({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated?: (workflow: Workflow) => void;
}) {
  const [goal, setGoal] = useState("Translate and fact-check a document");
  const [budget, setBudget] = useState(10);
  const [tier, setTier] = useState<Tier>("free");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, goal, budgetAlgo: budget, tier }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed to create workflow");
      window.dispatchEvent(new CustomEvent("veldar:workflow-created", { detail: body.workflow }));
      onCreated?.(body.workflow);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-fit flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="goal" className="text-sm font-medium text-[var(--color-headline)]">
          Goal
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="budget" className="text-sm font-medium text-[var(--color-headline)]">
          Budget (ALGO)
        </label>
        <input
          id="budget"
          type="number"
          min={0.1}
          step={0.1}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="tier" className="text-sm font-medium text-[var(--color-headline)]">
          Subscription tier
        </label>
        <select
          id="tier"
          value={tier}
          onChange={(e) => setTier(e.target.value as Tier)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="promax">ProMax</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-[var(--color-cta)] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Starting..." : "Start workflow"}
      </button>
    </form>
  );
}

function WorkflowPanel() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [trace, setTrace] = useState<LedgerEvent[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

  async function refresh(id: string) {
    const [wfRes, traceRes] = await Promise.all([
      fetch(`/api/workflows/${id}`),
      fetch(`/api/workflows/${id}/trace`),
    ]);
    const wfBody = await wfRes.json();
    const traceBody = await traceRes.json();
    if (wfRes.ok) setWorkflow(wfBody.workflow);
    if (traceRes.ok) setTrace(traceBody.trace);
  }

  useEffect(() => {
    function handleCreated(e: Event) {
      const wf = (e as CustomEvent<Workflow>).detail;
      setWorkflow(wf);
      void refresh(wf.id);
    }
    window.addEventListener("veldar:workflow-created", handleCreated);
    return () => window.removeEventListener("veldar:workflow-created", handleCreated);
  }, []);

  const pendingApproval = workflow
    ? trace.find(
        (e) => e.type === "approval_requested" && e.workflowId === workflow.id
      )
    : null;

  async function approve(decision: "approved" | "denied") {
    if (!workflow || !pendingApproval) return;
    setApproving(decision);
    const approvalId = pendingApproval.detail.approvalId as string;
    await fetch(`/api/workflows/${workflow.id}/approve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approvalId, decision }),
    });
    await refresh(workflow.id);
    setApproving(null);
  }

  if (!workflow) {
    return (
      <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
        <p className="text-sm text-[var(--color-muted)]">
          Start a workflow to see its trace here: offers, quotes, approvals, and settlements as
          they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-headline)]">{workflow.goal}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {workflow.spentAlgo} / {workflow.budgetAlgo} ALGO &middot; {workflow.status}
          </p>
        </div>
        <div className="flex items-center gap-3">
        <Link
          href={`/trace/${workflow.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          Full trace
          <ArrowUpRight size={14} />
        </Link>
        {pendingApproval && (
          <div className="flex gap-2">
            <button
              onClick={() => approve("denied")}
              disabled={approving !== null}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-headline)] disabled:opacity-50"
            >
              Deny
            </button>
            <button
              onClick={() => approve("approved")}
              disabled={approving !== null}
              className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Approve {(pendingApproval.detail.amountAlgo as number) ?? ""} ALGO
            </button>
          </div>
        )}
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {trace.map((event) => (
          <li key={event.id} className="flex items-center gap-3 text-sm">
            <CheckCircle
              size={14}
              weight="fill"
              className={
                event.type === "step_failed" ? "text-red-400" : "text-[var(--color-cta)]"
              }
            />
            <span className="text-[var(--color-body)]">{event.type.replace(/_/g, " ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
