"use client";

// A real (if static, for the marketing page) rendering of the trace shape
// the orchestrator actually produces (see website/lib/orchestrator.ts
// LedgerEvent / WorkflowStep types) — not a div-mockup of a fake product.

import { CheckCircle, CircleDashed, Coins, Hourglass } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

interface TraceRow {
  label: string;
  provider: string;
  amount: string;
  status: "fulfilled" | "paid" | "awaiting_approval";
}

const ROWS: TraceRow[] = [
  { label: "Translate document", provider: "translate-api.example", amount: "2.5 ALGO", status: "fulfilled" },
  { label: "Fact-check translation", provider: "fact-check-api.example", amount: "1.0 ALGO", status: "paid" },
  { label: "Local verification pass", provider: "veldar-laptop-rtx4050", amount: "up to 3.0 ALGO", status: "awaiting_approval" },
];

const STATUS_META = {
  fulfilled: { icon: CheckCircle, text: "text-emerald-400", label: "Verified" },
  paid: { icon: Coins, text: "text-[var(--color-cta)]", label: "Paid" },
  awaiting_approval: { icon: Hourglass, text: "text-[var(--color-accent)]", label: "Awaiting approval" },
} as const;

export function TracePreview() {
  const reduce = useReducedMotion();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_24px_60px_rgb(0_0_0_/_0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
          Workflow trace
        </span>
        <span className="text-xs text-[var(--color-footer-dim)]">3.5 / 6.5 ALGO budget</span>
      </div>

      <ul className="flex flex-col gap-3">
        {ROWS.map((row, i) => {
          const meta = STATUS_META[row.status];
          const Icon = meta.icon;
          return (
            <motion.li
              key={row.label}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} weight="fill" className={meta.text} />
                <div>
                  <p className="text-sm font-medium text-[var(--color-headline)]">{row.label}</p>
                  <p className="text-xs text-[var(--color-muted)]">{row.provider}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-[var(--color-headline)]">{row.amount}</p>
                <p className={`text-[11px] ${meta.text}`}>{meta.label}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-footer-dim)]">
        <CircleDashed size={14} />
        Settling on Algorand TestNet, replayable end to end.
      </div>
    </div>
  );
}
