"use client";

import { useState, useEffect } from "react";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  done: boolean;
}

const TRACKING_STAGES: TrackingEvent[] = [
  { status: "Order Confirmed", location: "Veldar Escrow Locked", timestamp: "", done: true },
  { status: "Picked Up by Carrier", location: "Seller Warehouse", timestamp: "", done: true },
  { status: "In Transit", location: "Regional Hub", timestamp: "", done: true },
  { status: "Out for Delivery", location: "Local Facility", timestamp: "", done: false },
  { status: "Delivered — Escrow Released", location: "Your Address", timestamp: "", done: false },
];

function generateTrackingNumber() {
  return "VLDR" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function PackageTracker({
  productName,
  workflowSubmitted,
}: {
  productName: string;
  workflowSubmitted: boolean;
}) {
  const [trackingNumber] = useState(generateTrackingNumber);
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState(TRACKING_STAGES.map((s, i) => ({
    ...s,
    done: i < 3,
    timestamp: i < 3 ? new Date(Date.now() - (3 - i) * 3600000).toLocaleTimeString() : "",
  })));
  const [escaped, setEscaped] = useState(false);
  const [simulating, setSimulating] = useState(false);

  function simulateDelivery() {
    if (simulating) return;
    setSimulating(true);
    let stage = 3;
    const interval = setInterval(() => {
      setStages((prev) =>
        prev.map((s, i) => ({
          ...s,
          done: i <= stage,
          timestamp: i === stage ? new Date().toLocaleTimeString() : s.timestamp,
        }))
      );
      setCurrentStage(stage);
      if (stage === 4) {
        setEscaped(true);
        clearInterval(interval);
        setSimulating(false);
      }
      stage++;
    }, 1500);
  }

  if (!workflowSubmitted) return null;

  const deliveredStage = stages.find((s) => s.status === "Delivered — Escrow Released");

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📦</div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-headline)]">Real-Time Package Tracker</p>
            <p className="text-[11px] text-[var(--color-muted)] font-mono">{trackingNumber}</p>
          </div>
        </div>
        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-bold text-sky-400">
          {escaped ? "✅ Delivered" : "🚚 In Transit"}
        </span>
      </div>

      {/* Product */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] text-[var(--color-muted)]">Product</p>
        <p className="text-sm font-medium text-[var(--color-headline)] truncate">{productName}</p>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-0">
        {stages.map((stage, i) => (
          <div key={stage.status} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div
                className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500"
                style={{
                  borderColor: stage.done ? "#22c55e" : "rgba(255,255,255,0.15)",
                  background: stage.done ? "#22c55e20" : "transparent",
                }}
              >
                {stage.done && <span className="text-[10px]">✓</span>}
              </div>
              {i < stages.length - 1 && (
                <div
                  className="w-0.5 flex-1 my-1 min-h-[20px] rounded-full transition-all duration-500"
                  style={{ background: stage.done ? "#22c55e40" : "rgba(255,255,255,0.06)" }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${i === stages.length - 1 ? "pb-0" : ""}`}>
              <p
                className="text-xs font-semibold transition-colors"
                style={{ color: stage.done ? "#22c55e" : "var(--color-muted)" }}
              >
                {stage.status}
              </p>
              <p className="text-[11px] text-[var(--color-muted)]">{stage.location}</p>
              {stage.timestamp && (
                <p className="text-[10px] text-[var(--color-muted)] font-mono">{stage.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Escrow release banner */}
      {escaped ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
          <p className="text-sm font-bold text-emerald-400">🔓 Escrow Released!</p>
          <p className="text-[11px] text-emerald-300 mt-0.5">
            Payment automatically released to seller upon confirmed delivery.
          </p>
          <p className="text-[10px] text-emerald-500 mt-1 font-mono">
            Algorand txn: {generateTrackingNumber().toLowerCase()}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={simulateDelivery}
          disabled={simulating}
          className="rounded-xl border border-sky-500/25 bg-sky-500/10 py-3 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-all disabled:opacity-50"
        >
          {simulating ? "📦 Tracking live…" : "▶ Simulate Delivery (Demo)"}
        </button>
      )}
    </div>
  );
}
