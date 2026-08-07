"use client";

import { useEffect, useState } from "react";

interface CurrencyData {
  rates: Record<string, number>;
  unitRates: Record<string, number>;
  updatedAt: string;
  fallback?: boolean;
}

const FLAGS: Record<string, string> = {
  USD: "🇺🇸", INR: "🇮🇳", EUR: "🇪🇺", GBP: "🇬🇧", SGD: "🇸🇬",
};

export function CurrencyConverter({
  amount,
  base = "algorand",
  label,
}: {
  amount: number;
  base?: "algorand" | "stellar";
  label?: string;
}) {
  const [data, setData] = useState<CurrencyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    fetch(`/api/currency?amount=${amount}&base=${base}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [amount, base]);

  const ticker = base === "algorand" ? "ALGO" : "XLM";

  if (!data && !loading) return null;

  return (
    <div
      className="rounded-xl border border-sky-500/20 bg-sky-500/5 overflow-hidden cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">💱</span>
          <div>
            <p className="text-xs font-semibold text-sky-300">
              {label ?? `${amount} ${ticker}`} in real money
            </p>
            {loading ? (
              <p className="text-[11px] text-sky-500 animate-pulse">Fetching live rates…</p>
            ) : data ? (
              <p className="text-[11px] text-sky-400">
                ≈ <span className="font-mono font-bold">${data.rates.USD}</span> USD ·{" "}
                <span className="font-mono font-bold">₹{data.rates.INR}</span> INR
                {data.fallback && <span className="text-[10px] text-sky-600 ml-1">(cached)</span>}
              </p>
            ) : null}
          </div>
        </div>
        <span className="text-[10px] text-sky-500">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded rates */}
      {expanded && data && (
        <div className="grid grid-cols-5 gap-px border-t border-sky-500/15 bg-sky-500/10 divide-x divide-sky-500/10">
          {Object.entries(data.rates).map(([currency, value]) => (
            <div key={currency} className="flex flex-col items-center py-2.5 px-1 bg-[#0a0908]">
              <span className="text-base">{FLAGS[currency]}</span>
              <span className="text-[10px] text-sky-400 mt-0.5">{currency}</span>
              <span className="text-xs font-mono font-semibold text-[var(--color-headline)] mt-0.5">
                {currency === "INR" ? "₹" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "SGD" ? "S$" : "$"}
                {value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
