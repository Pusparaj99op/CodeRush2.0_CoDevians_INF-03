"use client";

import { useEffect, useRef, useState } from "react";
import {
  Warning,
  CheckCircle,
  AirplaneTakeoff,
  ShieldCheck,
  CircleNotch,
  Lightning,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";

interface FlightInfo {
  flightNo: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  status: "on-time" | "delayed" | "payout-pending" | "payout-settled";
  delayMinutes?: number;
  txId?: string;
  payoutAlgo?: number;
}

interface FlightDisruptionPanelProps {
  originCity?: string;
  destCity?: string;
  active?: boolean;
}

function randomTxId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return Array.from({ length: 52 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const AIRLINE_CODES = ["AI", "6E", "UK", "SG", "IX", "G8", "QP", "I5"];

function generateFlight(origin: string, dest: string): FlightInfo {
  const now = new Date();
  const dep = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const arr = new Date(dep.getTime() + 11 * 60 * 60 * 1000);
  const code = AIRLINE_CODES[Math.floor(Math.random() * AIRLINE_CODES.length)];
  const num = 100 + Math.floor(Math.random() * 900);
  return {
    flightNo: `${code} ${num}`,
    origin: (origin.split(",")[0] ?? origin).trim().slice(0, 3).toUpperCase(),
    destination: (dest.split(",")[0] ?? dest).trim().slice(0, 3).toUpperCase(),
    departure: dep.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    arrival: arr.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    status: "on-time",
  };
}

export function FlightDisruptionPanel({ originCity, destCity, active }: FlightDisruptionPanelProps) {
  const origin = originCity ?? "Mumbai";
  const dest = destCity ?? "Tokyo";
  const [flight, setFlight] = useState<FlightInfo>(() => generateFlight(origin, dest));
  const [phase, setPhase] = useState<"idle" | "monitoring" | "disrupted" | "verifying" | "settled">("idle");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset if cities change
  useEffect(() => {
    setFlight(generateFlight(origin, dest));
    setPhase("idle");
    setElapsed(0);
  }, [origin, dest]);

  // Start simulation when panel becomes active
  useEffect(() => {
    if (!active || phase !== "idle") return;
    setPhase("monitoring");

    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next === 6) {
          // Trigger delay at 6s
          setFlight((f) => ({ ...f, status: "delayed", delayMinutes: 195 }));
          setPhase("disrupted");
        }
        if (next === 10) {
          // Start oracle verification
          setFlight((f) => ({ ...f, status: "payout-pending" }));
          setPhase("verifying");
        }
        if (next === 14) {
          // Settle payout
          const txId = randomTxId();
          setFlight((f) => ({ ...f, status: "payout-settled", txId, payoutAlgo: 0.3 }));
          setPhase("settled");
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, phase]);

  const statusConfig = {
    "on-time": { label: "On Time", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
    "delayed": { label: "DELAYED", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: Warning },
    "payout-pending": { label: "Verifying Oracle...", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: CircleNotch },
    "payout-settled": { label: "Insurance Paid ✓", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: ShieldCheck },
  };

  const cfg = statusConfig[flight.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AirplaneTakeoff size={16} className="text-[var(--color-cta)]" />
          <span className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            Flight Monitor + Parametric Insurance
          </span>
        </div>
        <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-inter text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
          <StatusIcon
            size={11}
            weight="fill"
            className={flight.status === "payout-pending" ? "animate-spin" : ""}
          />
          {cfg.label}
        </span>
      </div>

      {/* Flight card */}
      <div className={`rounded-xl border p-3.5 transition-all duration-700 ${
        flight.status === "delayed" || flight.status === "payout-pending"
          ? "border-red-500/40 bg-red-500/5"
          : flight.status === "payout-settled"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-white/5 bg-white/[0.02]"
      }`}>
        <div className="flex items-center justify-between gap-4">
          {/* Origin */}
          <div className="text-center">
            <p className="font-poppins text-lg font-bold text-[var(--color-headline)]">{flight.origin}</p>
            <p className="font-inter text-[10px] text-[var(--color-muted)]">DEP {flight.departure}</p>
          </div>

          {/* Flight arc */}
          <div className="flex flex-1 flex-col items-center gap-0.5">
            <p className="font-inter text-[10px] font-bold text-[var(--color-muted)]">{flight.flightNo}</p>
            <div className="relative w-full">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-muted)]/40 to-transparent" />
              <AirplaneTakeoff
                size={14}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                  flight.status === "delayed" ? "text-red-400" : "text-[var(--color-cta)]"
                }`}
                weight="fill"
              />
            </div>
            {flight.delayMinutes && (
              <p className="font-inter text-[10px] font-bold text-red-400 animate-pulse">
                ⚠️ +{Math.floor(flight.delayMinutes / 60)}h {flight.delayMinutes % 60}m Delay
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="text-center">
            <p className="font-poppins text-lg font-bold text-[var(--color-headline)]">{flight.destination}</p>
            <p className="font-inter text-[10px] text-[var(--color-muted)]">ARR {flight.arrival}</p>
          </div>
        </div>
      </div>

      {/* Smart contract pipeline steps */}
      <div className="flex flex-col gap-1.5">
        {[
          {
            label: "Delay oracle verification",
            done: phase === "verifying" || phase === "settled",
            active: phase === "disrupted",
          },
          {
            label: "Smart contract condition check (≥3h delay)",
            done: phase === "settled",
            active: phase === "verifying",
          },
          {
            label: `Parametric payout: ${flight.payoutAlgo ?? 0.3} ALGO → your wallet`,
            done: phase === "settled",
            active: false,
          },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full flex-shrink-0 transition-colors ${
                step.done
                  ? "bg-emerald-400"
                  : step.active
                  ? "bg-amber-400 animate-pulse"
                  : "bg-white/10"
              }`}
            />
            <span className={`font-inter text-[11px] ${step.done ? "text-[var(--color-body)]" : "text-[var(--color-muted)]"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Settlement result */}
      {phase === "settled" && flight.txId && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2">
            <Lightning size={14} className="text-emerald-400" weight="fill" />
            <span className="font-poppins text-xs font-bold text-emerald-400">
              Insurance Settled — {flight.payoutAlgo} ALGO
            </span>
            <span className="ml-auto font-inter text-[9px] text-emerald-300/70">Finality: 1.2s</span>
          </div>
          <p className="font-mono text-[9px] text-emerald-300/60 break-all">
            TXID: {flight.txId.slice(0, 40)}...
          </p>
        </div>
      )}

      {/* Idle state */}
      {phase === "idle" && (
        <p className="font-poppins text-[11px] text-[var(--color-muted)]">
          Submit a travel workflow to start flight monitoring & parametric insurance simulation.
        </p>
      )}

      {phase === "monitoring" && (
        <div className="flex items-center gap-2 font-poppins text-[11px] text-[var(--color-muted)]">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Monitoring flight status in real-time... ({elapsed}s)
        </div>
      )}
    </div>
  );
}
