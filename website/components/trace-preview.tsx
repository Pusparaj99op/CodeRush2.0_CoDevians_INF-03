"use client";

import { CheckCircle, CircleDashed, Coins, Hourglass, Lightning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface StepItem {
  id: string;
  label: string;
  provider: string;
  amount: string;
  numericAlgo: number;
  status: "verified" | "paid" | "awaiting_approval";
  statusText: string;
}

const STEPS: StepItem[] = [
  {
    id: "step-1",
    label: "Flight & Airport Transit",
    provider: "ana-flight-api.algo",
    amount: "1.8 ALGO",
    numericAlgo: 1.8,
    status: "verified",
    statusText: "Verified On-Chain",
  },
  {
    id: "step-2",
    label: "Shinjuku Hotel Escrow",
    provider: "hotel-escrow.algo",
    amount: "1.7 ALGO",
    numericAlgo: 1.7,
    status: "paid",
    statusText: "Paid via x402",
  },
  {
    id: "step-3",
    label: "Sony WH-1000XM5 Headphones",
    provider: "tech-procurement.algo",
    amount: "up to 2.5 ALGO",
    numericAlgo: 0,
    status: "awaiting_approval",
    statusText: "Awaiting Cap Approval",
  },
];

export function TracePreview() {
  const [activeStepCount, setActiveStepCount] = useState(3);
  const [progressWidth, setProgressWidth] = useState(58);

  // Subtle continuous loop effect to make the trace feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressWidth((prev) => (prev === 58 ? 65 : 58));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d0b09]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      {/* Header Bar */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#ff5228] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-headline)]">
            Workflow Trace
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#ff5228]">3.5 / 6.0 ALGO</span>
          <span className="text-[10px] uppercase text-[var(--color-muted)]">budget</span>
        </div>
      </div>

      {/* Animated Budget Bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#ff4a1f] via-[#ff6b2e] to-[#ff5228]"
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Step Cards List */}
      <div className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const isVerified = step.status === "verified";
          const isPaid = step.status === "paid";
          const isAwaiting = step.status === "awaiting_approval";

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className={`group flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                isAwaiting
                  ? "border-[#ff5228]/50 bg-[#ff5228]/[0.06] shadow-[0_0_15px_rgba(255,82,40,0.15)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    isVerified
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : isPaid
                      ? "bg-[#ff5228]/15 text-[#ff5228] border border-[#ff5228]/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                  }`}
                >
                  {isVerified && <CheckCircle size={18} weight="fill" />}
                  {isPaid && <Coins size={18} weight="fill" />}
                  {isAwaiting && <Hourglass size={18} weight="fill" className="animate-spin" style={{ animationDuration: '4s' }} />}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-headline)]">
                    {step.label}
                  </p>
                  <p className="truncate font-mono text-[11px] text-[var(--color-muted)]">
                    {step.provider}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-mono text-xs font-semibold text-[var(--color-headline)]">
                  {step.amount}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium ${
                    isVerified
                      ? "text-emerald-400"
                      : isPaid
                      ? "text-[#ff5228]"
                      : "text-amber-300"
                  }`}
                >
                  {step.statusText}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Live Indicator */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5 text-xs text-[var(--color-footer-dim)]">
        <div className="flex items-center gap-2">
          <CircleDashed size={14} className="animate-spin text-[#ff5228]" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-medium text-[var(--color-body)]">
            Settling on Algorand TestNet • Step 3 of 3
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#ff5228]/80">x402 Active</span>
      </div>
    </div>
  );
}
