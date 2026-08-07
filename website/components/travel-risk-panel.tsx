"use client";

import { useEffect, useState } from "react";

interface RiskData {
  level: string;
  country: string;
  summary: string;
  levelInfo: { label: string; color: string; emoji: string };
  healthAlert: boolean;
  updated?: string;
  source: string;
  whoAlert: boolean;
}

export function TravelRiskPanel({ destination }: { destination: string }) {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevDest, setPrevDest] = useState("");

  useEffect(() => {
    if (!destination || destination === prevDest || destination.length < 3) return;
    const timer = setTimeout(() => {
      setLoading(true);
      setPrevDest(destination);
      fetch(`/api/travel-risk?destination=${encodeURIComponent(destination)}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, 800); // debounce
    return () => clearTimeout(timer);
  }, [destination, prevDest]);

  if (!destination || destination.length < 3) return null;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: data ? `${data.levelInfo.color}40` : "rgba(255,255,255,0.1)",
        background: data ? `${data.levelInfo.color}08` : "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {loading ? (
          <div className="flex items-center gap-2.5 w-full">
            <span className="text-lg animate-pulse">🛡️</span>
            <div>
              <p className="text-xs font-semibold text-[var(--color-headline)]">Checking travel advisories…</p>
              <p className="text-[11px] text-[var(--color-muted)] animate-pulse">Querying US State Dept database</p>
            </div>
          </div>
        ) : data ? (
          <>
            <span className="text-2xl mt-0.5 shrink-0">{data.levelInfo.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: data.levelInfo.color }}>
                  {data.country} — Level {data.level}
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    background: `${data.levelInfo.color}20`,
                    color: data.levelInfo.color,
                    border: `1px solid ${data.levelInfo.color}40`,
                  }}
                >
                  {data.levelInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-body)] mt-1 leading-relaxed">{data.summary}</p>

              {data.healthAlert && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-orange-400">
                  <span>⚠️</span>
                  <span>Health alert active — check WHO Travel Advisory</span>
                </div>
              )}

              <p className="mt-2 text-[10px] text-[var(--color-muted)]">
                Source: {data.source}
                {data.updated && ` · Updated ${data.updated}`}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
