"use client";

import { ArrowClockwise, CheckCircle, CircleDashed, Coins, Hourglass, Lightning } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

interface FeedItem {
  id: string;
  label: string;
  provider: string;
  amount: string;
  algoVal: number;
  status: "fulfilled" | "paid" | "awaiting_approval" | "processing";
  timestamp: string;
}

const INITIAL_FEED: FeedItem[] = [
  { id: "1", label: "Translate query context", provider: "translate-api.algorand", amount: "2.5 ALGO", algoVal: 2.5, status: "fulfilled", timestamp: "12:41:03" },
  { id: "2", label: "Fact-check translation", provider: "fact-check-api.algo", amount: "1.0 ALGO", algoVal: 1.0, status: "paid", timestamp: "12:41:07" },
  { id: "3", label: "Local verification pass", provider: "veldar-laptop-rtx4050", amount: "up to 3.0 ALGO", algoVal: 3.0, status: "awaiting_approval", timestamp: "12:41:12" },
];

const STREAMING_POOL = [
  { label: "Search vector index", provider: "pinecone-adapter.algo", amount: "0.4 ALGO", algoVal: 0.4 },
  { label: "Synthesize summary", provider: "llama-3b-local", amount: "1.2 ALGO", algoVal: 1.2 },
  { label: "Anchor hash on-chain", provider: "x402-facilitator.testnet", amount: "0.1 ALGO", algoVal: 0.1 },
  { label: "Code audit pass", provider: "audit-bot.algo", amount: "2.0 ALGO", algoVal: 2.0 },
];

const STATUS_META = {
  fulfilled: { icon: CheckCircle, text: "text-emerald-400", label: "Verified On-Chain", badgeClass: "veldar-badge-emerald" },
  paid: { icon: Coins, text: "text-[#ff5228]", label: "Paid x402", badgeClass: "veldar-badge-accent" },
  awaiting_approval: { icon: Hourglass, text: "text-amber-300", label: "Awaiting Cap Approval", badgeClass: "veldar-badge-muted" },
  processing: { icon: CircleDashed, text: "text-amber-400 animate-spin", label: "Quoting Marketplace", badgeClass: "veldar-badge-muted" },
} as const;

export function LivePaymentTicker() {
  const reduce = useReducedMotion();
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [totalSpent, setTotalSpent] = useState(3.5);
  const maxBudget = 6.5;

  useEffect(() => {
    if (reduce) return;

    let poolIdx = 0;
    const interval = setInterval(() => {
      const item = STREAMING_POOL[poolIdx % STREAMING_POOL.length];
      poolIdx++;
      if (!item) return;

      const now = new Date();
      const timestamp = now.toTimeString().split(" ")[0] ?? "";

      const newItem: FeedItem = {
        id: Date.now().toString(),
        label: item.label,
        provider: item.provider,
        amount: item.amount,
        algoVal: item.algoVal,
        status: "fulfilled",
        timestamp,
      };

      setFeed((prev) => [newItem, ...prev.slice(0, 4)]);
      setTotalSpent((prev) => (prev + item.algoVal > maxBudget ? 3.5 : parseFloat((prev + item.algoVal).toFixed(1))));
    }, 3500);

    return () => clearInterval(interval);
  }, [reduce]);

  const percentage = Math.min(100, Math.round((totalSpent / maxBudget) * 100));

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="veldar-badge-accent uppercase tracking-wider text-[11px]">
              <Lightning size={14} weight="fill" />
              Live Web3 Payment Feed
            </span>
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-[var(--color-headline)] md:text-4xl">
              Algorand micropayments in motion.
            </h2>
          </div>
          <p className="max-w-md text-sm text-[var(--color-body)]">
            As your agent executes multi-provider steps, payments settle automatically via x402 with on-chain cryptographic proofs.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/15 bg-[#0d0b09]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          {/* Header Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 font-mono text-xs">
            <div className="flex items-center gap-2.5 text-[var(--color-headline)] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>LIVE x402 FACILITATOR FEED</span>
            </div>

            <div className="flex items-center gap-4 text-[var(--color-muted)] text-[11px]">
              <span className="flex items-center gap-1.5">
                <ArrowClockwise size={12} className="animate-spin text-emerald-400" />
                Algorand TestNet
              </span>
              <span>•</span>
              <span>Block Finality: ~1.2s</span>
            </div>
          </div>

          {/* Feed List Table */}
          <div className="flex flex-col gap-2.5 divide-y divide-white/5">
            {feed.map((row) => {
              const meta = STATUS_META[row.status];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={row.id}
                  layout
                  initial={reduce ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3.5 transition-colors hover:border-white/15 hover:bg-white/[0.035] sm:grid-cols-[1fr_auto_140px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={20} weight="fill" className={`shrink-0 ${meta.text}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-headline)]">{row.label}</p>
                      <p className="truncate font-mono text-xs text-[var(--color-muted)]">{row.provider}</p>
                    </div>
                  </div>

                  <div className="justify-self-start sm:justify-self-center">
                    <span className={meta.badgeClass}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-sm font-semibold text-[var(--color-headline)]">{row.amount}</p>
                    <p className="text-[10px] text-[var(--color-muted)]">{row.timestamp}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Live Budget Bar */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-headline)]">Workflow Budget Utilization</span>
              <span className="font-mono font-medium text-[var(--color-headline)]">
                {totalSpent} / {maxBudget} ALGO ({percentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff4a1f] via-[#ff6b2e] to-[#ff5228] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
