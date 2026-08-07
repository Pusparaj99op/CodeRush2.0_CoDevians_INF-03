"use client";

import { useState } from "react";

interface AgentBid {
  agentName: string;
  emoji: string;
  strategy: string;
  vendorName: string;
  price: string;
  deliveryDays: number;
  rating: number;
  highlights: string[];
  confidence: number;
}

interface NegotiationResult {
  agents: AgentBid[];
  winner: AgentBid;
  product: string;
  budget: number;
}

export function AgentNegotiationPanel({
  product,
  budget,
  onSelectBid,
}: {
  product: string;
  budget: number;
  onSelectBid?: (bid: AgentBid) => void;
}) {
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [phase, setPhase] = useState(0); // animation phase

  async function runNegotiation() {
    if (!product.trim()) return;
    setLoading(true);
    setResult(null);
    setPhase(0);

    // Animate phases
    const phaseTimer = setInterval(() => setPhase((p) => Math.min(p + 1, 2)), 900);

    try {
      const res = await fetch("/api/agent-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, budget: budget * 180 }), // ALGO to USD approx
      });
      const data = await res.json();
      setResult(data);
      setSelectedAgent(data.winner?.agentName ?? null);
    } catch {
      setResult(null);
    } finally {
      clearInterval(phaseTimer);
      setLoading(false);
      setPhase(3);
    }
  }

  const PHASE_LABELS = [
    "🔍 Scanning vendor databases…",
    "⚡ Agents negotiating in parallel…",
    "🏆 Selecting winning bid…",
    "✅ Negotiation complete",
  ];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-base">
            🤖
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-headline)]">Multi-Agent Supplier Negotiation</p>
            <p className="text-[11px] text-[var(--color-muted)]">3 AI agents compete to get you the best deal</p>
          </div>
        </div>
        <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[10px] font-bold text-violet-400 uppercase tracking-wide">
          Live Bidding
        </span>
      </div>

      {/* Agents row — always visible */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: "💰", name: "Agent PRICE", desc: "Lowest Cost", color: "#22c55e" },
          { emoji: "⚡", name: "Agent SPEED", desc: "Fastest Ship", color: "#38bdf8" },
          { emoji: "⭐", name: "Agent QUALITY", desc: "Best Quality", color: "#a78bfa" },
        ].map(({ emoji, name, desc, color }, i) => {
          const agentResult = result?.agents.find((a) => a.agentName === name);
          const isWinner = agentResult && result?.winner?.agentName === name;
          const isSelected = selectedAgent === name;

          return (
            <div
              key={name}
              onClick={() => {
                if (!agentResult) return;
                setSelectedAgent(name);
                onSelectBid?.(agentResult);
              }}
              className="relative flex flex-col gap-2 rounded-xl border p-3 transition-all duration-300 cursor-pointer"
              style={{
                borderColor: isSelected ? `${color}60` : "rgba(255,255,255,0.08)",
                background: isSelected ? `${color}10` : "rgba(255,255,255,0.02)",
              }}
            >
              {isWinner && (
                <span className="absolute -top-2 right-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-black">
                  WINNER
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-base">{emoji}</span>
                <div>
                  <p className="text-[11px] font-bold text-[var(--color-headline)]">{name}</p>
                  <p className="text-[10px]" style={{ color }}>{desc}</p>
                </div>
              </div>

              {loading && i <= phase ? (
                <p className="text-[10px] text-[var(--color-muted)] animate-pulse">Searching…</p>
              ) : agentResult ? (
                <>
                  <p className="text-sm font-bold" style={{ color }}>{agentResult.price}</p>
                  <p className="text-[10px] text-[var(--color-muted)]">{agentResult.deliveryDays}d delivery · ⭐ {agentResult.rating}</p>
                  <p className="text-[10px] text-[var(--color-body)] truncate">{agentResult.vendorName}</p>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${agentResult.confidence}%`, background: color }}
                    />
                  </div>
                  <p className="text-[9px] text-[var(--color-muted)]">{agentResult.confidence}% confidence</p>
                </>
              ) : (
                <p className="text-[10px] text-[var(--color-muted)]">Awaiting bid…</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Phase indicator */}
      {loading && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-500/5 border border-violet-500/15 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <p className="text-xs text-violet-300 font-medium">{PHASE_LABELS[Math.min(phase, 3)]}</p>
        </div>
      )}

      {/* Winner card */}
      {result?.winner && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide mb-2">🏆 Best Deal Selected</p>
          <div className="flex flex-wrap gap-2">
            {result.winner.highlights?.map((h) => (
              <span key={h} className="text-[11px] rounded-lg bg-white/5 border border-white/8 px-2.5 py-1 text-[var(--color-body)]">
                ✓ {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        type="button"
        onClick={runNegotiation}
        disabled={loading || !product.trim()}
        className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200"
        style={{
          background: loading ? "rgba(167,139,250,0.1)" : "rgba(167,139,250,0.2)",
          border: "1px solid rgba(167,139,250,0.3)",
          color: loading ? "#a78bfa80" : "#a78bfa",
          cursor: loading || !product.trim() ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <><span className="animate-spin">⚙️</span> Agents negotiating…</>
        ) : result ? (
          <>🔄 Re-run Negotiation</>
        ) : (
          <>🤖 Start Agent Negotiation</>
        )}
      </button>
    </div>
  );
}
