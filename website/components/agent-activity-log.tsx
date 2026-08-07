"use client";

import { useEffect, useRef, useState } from "react";
import { Robot, CheckCircle, CircleNotch, X } from "@phosphor-icons/react";

export interface AgentStep {
  id: string;
  emoji: string;
  message: string;
  status: "pending" | "running" | "done" | "error";
  timestamp?: string;
  detail?: string;
}

function buildStepsForGoal(goal: string, domain: "travel" | "ecommerce"): AgentStep[] {
  const now = Date.now();
  const ts = (offsetMs: number) => {
    const d = new Date(now + offsetMs);
    return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (domain === "travel") {
    const dest = goal.match(/to ([A-Z][a-z]+ ?[A-Z]?[a-z]*)/)?.[1] ?? "destination";
    return [
      { id: "1", emoji: "🎯", message: `Goal received: "${goal.slice(0, 60)}..."`, status: "pending", timestamp: ts(0) },
      { id: "2", emoji: "🔍", message: `Parsing travel intent — origin, destination, dates`, status: "pending", timestamp: ts(800) },
      { id: "3", emoji: "✈️", message: `Searching flights to ${dest}...`, status: "pending", timestamp: ts(1600), detail: "Checking: AI, 6E, EK routes" },
      { id: "4", emoji: "🏨", message: `Querying hotels near ${dest}...`, status: "pending", timestamp: ts(2400), detail: "Overpass API · 5km radius" },
      { id: "5", emoji: "💵", message: `Converting budget: ${(Math.random() * 2 + 0.5).toFixed(1)} ALGO → USD (CoinGecko)`, status: "pending", timestamp: ts(3200) },
      { id: "6", emoji: "🛡️", message: `Configuring parametric flight delay insurance`, status: "pending", timestamp: ts(4000), detail: "Condition: delay ≥ 3h → 0.3 ALGO payout" },
      { id: "7", emoji: "🔐", message: `Generating x402 payment intent...`, status: "pending", timestamp: ts(4800) },
      { id: "8", emoji: "📋", message: `SHA-256 hashing payment payload`, status: "pending", timestamp: ts(5600), detail: "Web Crypto API" },
      { id: "9", emoji: "✍️", message: `Signing x402 Authorization header`, status: "pending", timestamp: ts(6400) },
      { id: "10", emoji: "⛓️", message: `Broadcasting to Algorand TestNet...`, status: "pending", timestamp: ts(7200) },
      { id: "11", emoji: "✅", message: `Workflow complete — travel plan ready`, status: "pending", timestamp: ts(8000) },
    ];
  }

  // Ecommerce
  const product = goal.match(/Apple ([A-Za-z0-9 ]+)/)?.[1] ?? "product";
  return [
    { id: "1", emoji: "🎯", message: `Goal received: "${goal.slice(0, 55)}..."`, status: "pending", timestamp: ts(0) },
    { id: "2", emoji: "🔍", message: `Parsing product procurement intent`, status: "pending", timestamp: ts(700) },
    { id: "3", emoji: "🛒", message: `Scanning product price across retailers...`, status: "pending", timestamp: ts(1400), detail: "Amazon · Apple · Best Buy" },
    { id: "4", emoji: "💰", message: `Converting budget to crypto equivalent`, status: "pending", timestamp: ts(2100), detail: "ALGO / ETH / XLM pricing" },
    { id: "5", emoji: "🧾", message: `Preparing NFT digital receipt template (ASA)`, status: "pending", timestamp: ts(2800) },
    { id: "6", emoji: "📦", message: `Initializing supply chain tracking on Algorand`, status: "pending", timestamp: ts(3500) },
    { id: "7", emoji: "🔐", message: `Generating x402 payment intent...`, status: "pending", timestamp: ts(4200) },
    { id: "8", emoji: "⛓️", message: `Broadcasting to Algorand TestNet...`, status: "pending", timestamp: ts(5000) },
    { id: "9", emoji: "✅", message: `Procurement workflow complete — receipt minted`, status: "pending", timestamp: ts(5800) },
  ];
}

interface AgentActivityLogProps {
  domain: "travel" | "ecommerce";
  goal: string;
  active: boolean;
}

export function AgentActivityLog({ domain, goal, active }: AgentActivityLogProps) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [cursor, setCursor] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    const generated = buildStepsForGoal(goal, domain);
    // Mark first as running
    if (generated.length > 0) generated[0]!.status = "running";
    setSteps(generated);
    setCursor(0);
  }, [active, goal, domain]);

  useEffect(() => {
    if (!active || steps.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCursor((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        setSteps((s) => {
          const copy = [...s];
          if (copy[prev]) copy[prev] = { ...copy[prev]!, status: "done" };
          if (copy[next]) copy[next] = { ...copy[next]!, status: "running" };
          return copy;
        });
        return next;
      });
    }, 900);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, steps.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cursor]);

  if (!active && steps.length === 0) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Robot size={16} className="text-[var(--color-cta)]" weight="fill" />
          <span className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            AI Agent Activity Log
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-cta)] to-[#ff8c5a] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-inter text-[10px] text-[var(--color-muted)]">{doneCount}/{total}</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex max-h-[280px] flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
        {steps.map((step, i) => {
          const isVisible = step.status !== "pending" || i <= cursor + 1;
          if (!isVisible) return null;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-[11px] transition-all duration-300 ${
                step.status === "running"
                  ? "border border-[var(--color-cta)]/20 bg-[var(--color-cta)]/5"
                  : step.status === "done"
                  ? "bg-transparent"
                  : "opacity-40"
              }`}
            >
              {/* Status icon */}
              <div className="mt-0.5 shrink-0">
                {step.status === "running" && (
                  <CircleNotch size={13} className="text-[var(--color-cta)] animate-spin" />
                )}
                {step.status === "done" && (
                  <CheckCircle size={13} className="text-emerald-400" weight="fill" />
                )}
                {step.status === "pending" && (
                  <span className="block h-3 w-3 rounded-full border border-white/20" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span>{step.emoji}</span>
                  <span
                    className={`font-poppins ${
                      step.status === "running"
                        ? "text-[var(--color-headline)]"
                        : step.status === "done"
                        ? "text-[var(--color-body)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {step.message}
                  </span>
                </div>
                {step.detail && step.status !== "pending" && (
                  <p className="font-mono mt-0.5 text-[9px] text-[var(--color-muted)]/70">{step.detail}</p>
                )}
              </div>

              {/* Timestamp */}
              {step.timestamp && step.status !== "pending" && (
                <span className="font-mono shrink-0 text-[9px] text-[var(--color-muted)]/50">
                  {step.timestamp}
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
