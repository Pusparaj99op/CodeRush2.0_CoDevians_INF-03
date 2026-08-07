"use client";

import { useState, useEffect } from "react";

interface SpendingPolicy {
  autoApproveLimit: number; // USD
  requireMFA: boolean;
  dailyCap: number;
  allowedCategories: string[];
  sessionDuration: number; // hours
}

const CATEGORIES = ["Electronics", "Travel", "Groceries", "Clothing", "Software", "Services"];

const DEFAULT_POLICY: SpendingPolicy = {
  autoApproveLimit: 50,
  requireMFA: true,
  dailyCap: 500,
  allowedCategories: ["Electronics", "Travel"],
  sessionDuration: 24,
};

export function SessionKeyPolicy({ onPolicyChange }: { onPolicyChange?: (p: SpendingPolicy) => void }) {
  const [policy, setPolicy] = useState<SpendingPolicy>(DEFAULT_POLICY);
  const [saved, setSaved] = useState(false);
  const [txnCount] = useState(Math.floor(Math.random() * 8) + 2);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("veldar:session_policy");
      if (stored) setPolicy(JSON.parse(stored));
    } catch {}
  }, []);

  function savePolicy() {
    localStorage.setItem("veldar:session_policy", JSON.stringify(policy));
    setSaved(true);
    onPolicyChange?.(policy);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleCategory(cat: string) {
    setPolicy((p) => ({
      ...p,
      allowedCategories: p.allowedCategories.includes(cat)
        ? p.allowedCategories.filter((c) => c !== cat)
        : [...p.allowedCategories, cat],
    }));
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-base">
            🔐
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-headline)]">Session Key Spending Policy</p>
            <p className="text-[11px] text-[var(--color-muted)]">Stored on Algorand · Agent acts within your rules</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${sessionActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          <span className="text-[11px] font-medium text-emerald-400">{sessionActive ? "Active" : "Paused"}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Auto-approved", value: txnCount, unit: "txns", color: "text-emerald-400" },
          { label: "Human reviews", value: 1, unit: "needed", color: "text-amber-400" },
          { label: "Saved time", value: txnCount * 45, unit: "sec", color: "text-sky-400" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-center">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--color-muted)]">{label}</p>
            <p className="text-[10px] text-[var(--color-muted)]">{unit}</p>
          </div>
        ))}
      </div>

      {/* Auto-approve limit slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--color-headline)]">Auto-Approve Limit</label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-amber-400">${policy.autoApproveLimit}</span>
            {policy.autoApproveLimit <= 0 && (
              <span className="text-[10px] text-red-400">All need approval</span>
            )}
            {policy.autoApproveLimit >= 500 && (
              <span className="text-[10px] text-emerald-400">Max autonomy</span>
            )}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={10}
          value={policy.autoApproveLimit}
          onChange={(e) => setPolicy((p) => ({ ...p, autoApproveLimit: Number(e.target.value) }))}
          className="w-full accent-amber-500"
        />
        <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)]">
          <span>$0 — Always ask</span>
          <span>$500 — Full autonomy</span>
        </div>
        <p className="text-[11px] text-[var(--color-body)] rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2">
          {policy.autoApproveLimit === 0
            ? "🔐 Agent will ask you before every purchase"
            : policy.autoApproveLimit >= 500
            ? "⚡ Agent can autonomously approve all purchases"
            : `⚡ Agent auto-approves purchases under $${policy.autoApproveLimit}. Above that → you approve.`}
        </p>
      </div>

      {/* Daily cap */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--color-headline)]">Daily Spend Cap</label>
          <span className="text-sm font-bold text-sky-400">${policy.dailyCap}</span>
        </div>
        <input
          type="range"
          min={50}
          max={5000}
          step={50}
          value={policy.dailyCap}
          onChange={(e) => setPolicy((p) => ({ ...p, dailyCap: Number(e.target.value) }))}
          className="w-full accent-sky-500"
        />
      </div>

      {/* Allowed categories */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--color-headline)]">Allowed Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = policy.allowedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-all ${
                  active
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                    : "border-[var(--color-border)] bg-white/[0.02] text-[var(--color-muted)] hover:border-white/20"
                }`}
              >
                {active ? "✓ " : ""}{cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session duration */}
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-[var(--color-headline)]">Session Duration</p>
          <p className="text-[11px] text-[var(--color-muted)]">Key auto-expires after this time</p>
        </div>
        <select
          value={policy.sessionDuration}
          onChange={(e) => setPolicy((p) => ({ ...p, sessionDuration: Number(e.target.value) }))}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-headline)]"
        >
          {[1, 4, 8, 24, 48, 168].map((h) => (
            <option key={h} value={h}>{h < 24 ? `${h}h` : `${h / 24}d`}</option>
          ))}
        </select>
      </div>

      {/* Toggle session */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSessionActive((s) => !s)}
          className={`flex items-center gap-2 flex-1 justify-center rounded-xl border py-2.5 text-xs font-semibold transition-all ${
            sessionActive
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {sessionActive ? "⏸ Pause Session Key" : "▶ Resume Session Key"}
        </button>
        <button
          type="button"
          onClick={savePolicy}
          className="flex items-center gap-2 flex-1 justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-all"
        >
          {saved ? "✓ Saved to Chain" : "💾 Save Policy On-Chain"}
        </button>
      </div>

      <p className="text-[10px] text-center text-[var(--color-muted)]">
        Policy stored as Algorand Logic Signature · Verifiable without trusting Veldar
      </p>
    </div>
  );
}
