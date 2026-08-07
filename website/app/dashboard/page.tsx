"use client";

// Web dashboard overview: mirrors the App's live trace/approval UI
// (Doc/specs/01-app.md) and doubles as the demo surface for the hackathon
// walkthrough (Doc/specs/02-website.md). Talks directly to the
// orchestrator API routes already implemented under app/api/**.

import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  Lightning,
  PlugsConnected,
  ShieldCheck,
  Sparkle,
  Spinner,
  Wallet,
  XCircle,
  CaretRight,
  Copy,
  Check,
  Planet,
  DeviceMobile,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { authedFetch } from "@/lib/api-client";
import { UrlProductScanner } from "@/components/url-product-scanner";
import { useAuth } from "@/lib/auth-context";
import { connectLuteWallet, signPaymentWithLute } from "@/lib/lute-wallet";
import { connectFreighterWallet, signPaymentWithFreighter } from "@/lib/freighter-wallet";
import { connectMetaMask, signPaymentWithMetaMask } from "@/lib/metamask-wallet";
import type { LedgerEvent, SupportedChain, Tier, Workflow, WorkflowStep } from "@/lib/types";

const PRESET_GOALS = [
  {
    title: "iPhone 15 Pro Procurement (E-Commerce URL)",
    goal: "Procure product from URL (https://apple.com/iphone-15-pro): Apple iPhone 15 Pro Max 256GB from Apple Store",
    budget: 0.5,
    icon: DeviceMobile,
    badge: "E-Commerce",
  },
  {
    title: "Tokyo Trip & Tech Package",
    goal: "Book a trip to Tokyo with flights, hotel, and noise-canceling headphones under budget",
    budget: 1.0,
    icon: Sparkle,
    badge: "Travel",
  },
  {
    title: "Document Translation & Fact-Check",
    goal: "Translate and fact-check a document",
    budget: 0.5,
    icon: FileText,
    badge: "Popular",
  },
  {
    title: "Smart Contract Audit & Coverage",
    goal: "Analyze smart contract vulnerability and purchase coverage",
    budget: 0.5,
    icon: ShieldCheck,
    badge: "Security",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--color-headline)]">
          Welcome, {user?.displayName ?? "Agent Master"}.
        </h1>
        <p className="text-sm text-[var(--color-body)]">
          Submit an autonomous goal. Veldar will quote providers, request approvals, and settle step payments on Algorand.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {user && <WorkflowForm />}
        <WorkflowPanel />
      </div>
    </DashboardShell>
  );
}

function WorkflowForm() {
  const [goal, setGoal] = useState("Translate and fact-check a document");
  const [budget, setBudget] = useState(0.5);
  const [tier, setTier] = useState<Tier>("free");
  const [chain, setChain] = useState<SupportedChain>("algorand");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draftGoal = localStorage.getItem("veldar:draft_goal");
    const draftBudget = localStorage.getItem("veldar:draft_budget");
    if (draftGoal) {
      setGoal(draftGoal);
      localStorage.removeItem("veldar:draft_goal");
    }
    if (draftBudget) {
      setBudget(Number(draftBudget));
      localStorage.removeItem("veldar:draft_budget");
    }

    function handleFillGoal(e: Event) {
      const detail = (e as CustomEvent<{ goal: string; budgetAlgo?: number }>).detail;
      if (detail.goal) setGoal(detail.goal);
      if (detail.budgetAlgo) setBudget(detail.budgetAlgo);
    }
    window.addEventListener("veldar:fill-goal", handleFillGoal);
    return () => window.removeEventListener("veldar:fill-goal", handleFillGoal);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authedFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({ goal, budgetAlgo: budget, tier, chain }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed to create workflow");
      window.dispatchEvent(new CustomEvent("veldar:workflow-created", { detail: body.workflow }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function applyPreset(presetGoal: string, presetBudget: number) {
    setGoal(presetGoal);
    setBudget(presetBudget);
  }

  return (
    <div className="flex h-fit flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-headline)]">New Autonomous Goal</h2>
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[var(--color-accent)] uppercase">
            Agentic Pipeline
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="goal" className="text-xs font-semibold text-[var(--color-headline)]">
            Goal Description
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="Describe what you want Veldar to execute..."
            className="rounded-xl border border-[var(--color-border)] bg-transparent px-3.5 py-2.5 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="budget" className="text-xs font-semibold text-[var(--color-headline)]">
              Max Budget
            </label>
            <input
              id="budget"
              type="number"
              min={0.1}
              step={0.1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="chain" className="text-xs font-semibold text-[var(--color-headline)]">
              Payment Chain
            </label>
            <select
              id="chain"
              value={chain}
              onChange={(e) => setChain(e.target.value as SupportedChain)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              <option value="algorand">Algorand (Lute)</option>
              <option value="stellar">Stellar (Freight)</option>
              <option value="ethereum">Ethereum Sepolia (MetaMask)</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-cta)] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Spinner size={16} className="animate-spin" />
              <span>Compiling Workflow...</span>
            </>
          ) : (
            <>
              <Sparkle size={16} />
              <span>Start Autonomous Workflow</span>
            </>
          )}
        </button>
      </form>

      {/* E-Commerce URL Product Scanner */}
      <UrlProductScanner />

      {/* Preset Quick Launchers */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <p className="text-xs font-semibold text-[var(--color-headline)]">Quick Goal Templates</p>
        <div className="flex flex-col gap-2">
          {PRESET_GOALS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => applyPreset(preset.goal, preset.budget)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)]/60 bg-white/[0.02] p-3 text-left transition-colors hover:border-[var(--color-accent)]/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--color-headline)]">{preset.title}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{preset.budget} ALGO max</p>
                  </div>
                </div>
                <CaretRight size={14} className="shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-headline)] transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorkflowPanel() {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [trace, setTrace] = useState<LedgerEvent[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "events">("pipeline");

  async function refresh(id: string) {
    const [wfRes, traceRes] = await Promise.all([
      authedFetch(`/api/workflows/${id}`),
      authedFetch(`/api/workflows/${id}/trace`),
    ]);
    if (wfRes.ok) {
      const wfBody = await wfRes.json();
      setWorkflow(wfBody.workflow);
    }
    if (traceRes.ok) {
      const traceBody = await traceRes.json();
      setTrace(traceBody.trace);
    }
  }

  // Load existing workflows on mount
  useEffect(() => {
    if (!user) return;
    authedFetch("/api/workflows")
      .then(async (res) => {
        const body = await res.json();
        if (res.ok && body.workflows && body.workflows.length > 0) {
          const latest = body.workflows[0];
          setWorkflow(latest);
          void refresh(latest.id);
        }
      })
      .catch(() => {});
  }, [user]);

  // Listen for newly created workflows
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
    ? trace.find((e) => e.type === "approval_requested" && e.workflowId === workflow.id)
    : null;

  // Poll for updates while workflow is running or pending approval decision
  useEffect(() => {
    if (!workflow) return;
    if (workflow.status !== "running" && !pendingApproval) return;

    const timer = setInterval(() => {
      void refresh(workflow.id);
    }, 1200);

    return () => clearInterval(timer);
  }, [workflow, pendingApproval]);

  const [approvalError, setApprovalError] = useState<string | null>(null);

  async function approve(decision: "approved" | "denied", walletType: "lute" | "freighter" | "metamask" | "server" = "server") {
    if (!workflow || !pendingApproval) return;
    setApproving(decision);
    setApprovalError(null);
    try {
      const approvalId = pendingApproval.detail.approvalId as string;
      let luteTxnHash: string | undefined;

      if (decision === "approved" && walletType === "lute") {
        try {
          const savedLuteAddr = typeof window !== "undefined" ? localStorage.getItem("veldar:lute_address") : null;
          const luteAddr = savedLuteAddr ?? (await connectLuteWallet());
          const amountAlgo = (pendingApproval.detail.amountAlgo as number) ?? 1.0;
          const result = await signPaymentWithLute(
            luteAddr,
            "4SNSKGZL6TUKMZKJ3BELVCOXTZ653N2OVOKVWBLC26IGBNAAX35ZNW6HB4",
            amountAlgo
          );
          luteTxnHash = result.txnHash;
        } catch (luteErr) {
          setApprovalError((luteErr as Error).message);
          return;
        }
      } else if (decision === "approved" && walletType === "freighter") {
        try {
          const savedKey = typeof window !== "undefined" ? localStorage.getItem("veldar:freighter_key") : null;
          const pubKey = savedKey ?? (await connectFreighterWallet());
          const amountXlm = (pendingApproval.detail.amountAlgo as number) ?? 1.0;
          const result = await signPaymentWithFreighter(
            pubKey,
            "GBRPYHIL2CI3FNQ4BXLFMNDLFPPPU2HY523XYT6WL3L32T7MYW27L3R",
            amountXlm
          );
          luteTxnHash = result.txnHash;
        } catch (freighterErr) {
          setApprovalError((freighterErr as Error).message);
          return;
        }
      } else if (decision === "approved" && walletType === "metamask") {
        try {
          const savedAddr = typeof window !== "undefined" ? localStorage.getItem("veldar:metamask_address") : null;
          const conn = savedAddr ? { address: savedAddr } : await connectMetaMask();
          const amountEth = (pendingApproval.detail.amountAlgo as number) ?? 0.05;
          const result = await signPaymentWithMetaMask(
            conn.address,
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            amountEth
          );
          luteTxnHash = result.txnHash;
        } catch (metaMaskErr) {
          setApprovalError((metaMaskErr as Error).message);
          return;
        }
      }

      await authedFetch(`/api/workflows/${workflow.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approvalId, decision, luteTxnHash }),
      });
      await refresh(workflow.id);
    } catch (err) {
      setApprovalError((err as Error).message);
    } finally {
      setApproving(null);
    }
  }

  if (!workflow) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] p-12 text-center bg-[var(--color-bg-elevated)]/50">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] mb-4">
          <Sparkle size={24} />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-headline)]">No Active Workflow</h3>
        <p className="mt-1 max-w-sm text-xs text-[var(--color-muted)] leading-relaxed">
          Select a quick template or type a goal on the left to watch Veldar assemble providers, quote pricing, request approvals, and settle payments.
        </p>
      </div>
    );
  }

  const spendPercent = Math.min(100, Math.round((workflow.spentAlgo / (workflow.budgetAlgo || 1)) * 100));

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              workflow.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : workflow.status === "running"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 animate-pulse"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {workflow.status === "running" && <Spinner size={12} className="animate-spin" />}
              {workflow.status}
            </span>
            <span className="text-xs font-mono text-[var(--color-muted)]">ID: {workflow.id.slice(0, 8)}...</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-[var(--color-headline)]">{workflow.goal}</h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/trace/${workflow.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[var(--color-headline)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <span>Replay Trace</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Budget & Spend Gauge */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-[var(--color-border)]/70 bg-white/[0.02] p-4">
        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Spent / Budget</p>
          <p className="mt-1 text-base font-bold font-mono text-[var(--color-headline)]">
            {workflow.spentAlgo.toFixed(2)} / {workflow.budgetAlgo} <span className="text-xs font-sans font-normal text-[var(--color-accent)]">MAX</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${spendPercent}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Pipeline Steps</p>
          <p className="mt-1 text-base font-bold font-mono text-[var(--color-headline)]">
            {workflow.steps?.filter((s) => s.status === "fulfilled").length || 0} / {workflow.steps?.length || 0} <span className="text-xs font-sans font-normal text-emerald-400">Completed</span>
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Settlement Network</p>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Algorand & Stellar Multi-Chain TestNet</span>
          </div>
        </div>
      </div>

      {/* Pending Approval Callout Banner */}
      {pendingApproval && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-400 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider">Action Required: Human Approval Requested</p>
            </div>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
              {(pendingApproval.detail.amountAlgo as number) ?? 1.0}
            </span>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed">
            Provider <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-amber-300">{String(pendingApproval.detail.providerId ?? "Provider")}</code> requested approval for: &ldquo;{String(pendingApproval.detail.reason ?? "Execute next workflow step")}&rdquo;.
          </p>

          {approvalError && (
            <div className="flex flex-col gap-2 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-xs text-red-200">
              <p className="font-semibold text-red-300">Wallet Signing Notice:</p>
              <p className="text-[11px] leading-relaxed">{approvalError}</p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => approve("approved", "server")}
                  disabled={approving !== null}
                  className="rounded-full bg-[var(--color-cta)] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[var(--color-cta-hover)]"
                >
                  Proceed with Veldar Server Settlement
                </button>
              </div>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => approve("approved", "metamask")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/30 disabled:opacity-50"
            >
              <Lightning size={14} className="text-amber-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with MetaMask"}</span>
            </button>

            <button
              onClick={() => approve("approved", "freighter")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/30 disabled:opacity-50"
            >
              <Planet size={14} className="text-sky-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with Freight Wallet"}</span>
            </button>

            <button
              onClick={() => approve("approved", "lute")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:opacity-50"
            >
              <Wallet size={14} className="text-emerald-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with Lute Wallet"}</span>
            </button>

            <button
              onClick={() => approve("approved", "server")}
              disabled={approving !== null}
              className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-cta-hover)] disabled:opacity-50"
            >
              Approve {(pendingApproval.detail.amountAlgo as number) ?? ""}
            </button>

            <button
              onClick={() => approve("denied")}
              disabled={approving !== null}
              className="rounded-full border border-[var(--color-border)] bg-black/30 px-4 py-2 text-xs font-semibold text-[var(--color-headline)] transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "pipeline"
              ? "border-[var(--color-accent)] text-[var(--color-headline)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-headline)]"
          }`}
        >
          Pipeline Steps ({workflow.steps?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "events"
              ? "border-[var(--color-accent)] text-[var(--color-headline)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-headline)]"
          }`}
        >
          Ledger Event Stream ({trace.length})
        </button>
      </div>

      {/* Tab 1: Pipeline Steps Cards */}
      {activeTab === "pipeline" && (
        <div className="flex flex-col gap-3">
          {(!workflow.steps || workflow.steps.length === 0) && (
            <p className="py-6 text-center text-xs text-[var(--color-muted)]">Compiling workflow steps...</p>
          )}

          {workflow.steps?.map((step, idx) => (
            <StepCard key={step.id || idx} step={step} index={idx} />
          ))}
        </div>
      )}

      {/* Tab 2: Ledger Events Audit Stream */}
      {activeTab === "events" && (
        <ul className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
          {trace.map((event) => (
            <li key={event.id} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)]/50 bg-white/[0.01] p-3 text-xs">
              <CheckCircle
                size={16}
                weight="fill"
                className={`mt-0.5 shrink-0 ${
                  event.type === "step_failed"
                    ? "text-red-400"
                    : event.type === "payment_settled"
                    ? "text-emerald-400"
                    : "text-[var(--color-cta)]"
                }`}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--color-headline)] capitalize">{event.type.replace(/_/g, " ")}</span>
                  <span className="text-[10px] font-mono text-[var(--color-muted)]">
                    {new Date(event.at).toLocaleTimeString()}
                  </span>
                </div>
                {Object.keys(event.detail || {}).length > 0 && (
                  <pre className="mt-1.5 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-[11px] text-[var(--color-body)] leading-relaxed">
                    {JSON.stringify(event.detail, null, 2)}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  const isFulfilled = step.status === "fulfilled";
  const isAwaiting = step.status === "awaiting_approval";
  const isFailed = step.status === "failed";

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${
      isFulfilled
        ? "border-emerald-500/30 bg-emerald-500/[0.02]"
        : isAwaiting
        ? "border-amber-500/40 bg-amber-500/[0.03]"
        : isFailed
        ? "border-red-500/30 bg-red-500/[0.02]"
        : "border-[var(--color-border)] bg-white/[0.01]"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-[var(--color-headline)]">
            {index + 1}
          </span>
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-headline)]">{step.description}</h4>
            <p className="text-[11px] font-mono text-[var(--color-muted)]">Provider: {step.providerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
            isFulfilled
              ? "bg-emerald-500/15 text-emerald-300"
              : isAwaiting
              ? "bg-amber-500/15 text-amber-300"
              : isFailed
              ? "bg-red-500/15 text-red-300"
              : "bg-white/10 text-[var(--color-muted)]"
          }`}>
            {step.status.replace(/_/g, " ")}
          </span>

          {step.quotedPriceAlgo !== null && (
            <span className="font-mono text-xs font-semibold text-[var(--color-accent)]">
              {step.settledPriceAlgo ?? step.quotedPriceAlgo} ALGO
            </span>
          )}
        </div>
      </div>

      {/* Deliverable Output Box */}
      {step.output && (
        <div className="mt-1 rounded-lg border border-[var(--color-border)]/60 bg-black/40 p-3">
          <p className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">Step Deliverable Output</p>
          <p className="text-xs text-[var(--color-headline)] font-sans leading-relaxed whitespace-pre-wrap">{step.output}</p>
        </div>
      )}
    </div>
  );
}
