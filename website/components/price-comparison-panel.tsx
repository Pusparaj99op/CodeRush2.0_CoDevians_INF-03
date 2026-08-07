"use client";

import { useEffect, useState } from "react";
import {
  Storefront,
  CheckCircle,
  Trophy,
  ArrowDown,
  CurrencyDollar,
} from "@phosphor-icons/react";

interface StoreResult {
  store: string;
  logo: string;
  price: number;
  available: boolean;
  shipping: string;
  cryptoPrice?: number;
  cryptoSymbol?: string;
  isBest?: boolean;
}

interface PriceComparisonPanelProps {
  productName: string;
  basePrice?: number;
}

async function fetchAlgoPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd"
    );
    const data = await res.json();
    return data?.algorand?.usd ?? 0.18;
  } catch {
    return 0.18;
  }
}

function buildResults(productName: string, basePrice: number, algoPrice: number): StoreResult[] {
  // Simulate store pricing with slight variations
  const variation = (pct: number) => Math.round(basePrice * (1 + pct));
  const toAlgo = (usd: number) => Math.round(usd / algoPrice);

  const stores: Omit<StoreResult, "cryptoPrice" | "cryptoSymbol" | "isBest">[] = [
    { store: "Amazon", logo: "🛒", price: variation(-0.01), available: true, shipping: "Free 2-day shipping" },
    { store: "Apple Store", logo: "🍎", price: basePrice, available: true, shipping: "Ships in 1-3 days" },
    { store: "Best Buy", logo: "🔵", price: variation(-0.04), available: true, shipping: "Free store pickup" },
    { store: "Walmart", logo: "🏬", price: variation(-0.06), available: Math.random() > 0.3, shipping: "Free 3-5 day shipping" },
  ].sort((a, b) => a.price - b.price);

  return stores.map((s, i) => ({
    ...s,
    cryptoPrice: toAlgo(s.price),
    cryptoSymbol: "ALGO",
    isBest: i === 0 && s.available,
  }));
}

export function PriceComparisonPanel({ productName, basePrice = 1199 }: PriceComparisonPanelProps) {
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [algoPrice, setAlgoPrice] = useState(0.18);

  useEffect(() => {
    setLoading(true);
    // Simulate scan delay + fetch live ALGO price
    Promise.all([
      fetchAlgoPrice(),
      new Promise((r) => setTimeout(r, 1800)), // simulate scan time
    ]).then(([price]) => {
      setAlgoPrice(price as number);
      setResults(buildResults(productName, basePrice, price as number));
      setLoading(false);
    });
  }, [productName, basePrice]);

  const bestResult = results.find((r) => r.isBest);
  const savings = bestResult ? basePrice - bestResult.price : 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Storefront size={16} className="text-sky-400" weight="fill" />
          <span className="font-poppins text-xs font-bold text-[var(--color-headline)]">
            Live Price Comparison
          </span>
        </div>
        <span className="font-inter rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-400">
          AI Agent Scanning
        </span>
      </div>

      {/* Product */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
        <p className="font-poppins text-xs font-semibold text-[var(--color-headline)] truncate">{productName}</p>
        <p className="font-inter text-[10px] text-[var(--color-muted)]">
          Base MSRP: ${basePrice.toLocaleString()} · ALGO price: ${algoPrice.toFixed(4)}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
          <p className="font-poppins text-center text-[11px] text-[var(--color-muted)]">
            AI agent scanning retailers...
          </p>
        </div>
      ) : (
        <>
          {/* Savings banner */}
          {savings > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <Trophy size={14} className="text-emerald-400" weight="fill" />
              <span className="font-poppins text-[11px] font-semibold text-emerald-400">
                Best deal saves ${savings} vs. MSRP
              </span>
              <ArrowDown size={12} className="text-emerald-400 ml-auto" weight="bold" />
            </div>
          )}

          {/* Store rows */}
          <div className="flex flex-col gap-1.5">
            {results.map((r) => (
              <div
                key={r.store}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                  r.isBest
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : r.available
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-white/5 bg-white/[0.01] opacity-50"
                }`}
              >
                <span className="text-lg">{r.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-poppins text-xs font-semibold text-[var(--color-headline)]">
                      {r.store}
                    </span>
                    {r.isBest && (
                      <span className="font-inter text-[9px] font-bold text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
                        BEST DEAL
                      </span>
                    )}
                    {!r.available && (
                      <span className="font-inter text-[9px] text-red-400 bg-red-500/10 rounded px-1.5 py-0.5">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>
                  <p className="font-inter text-[10px] text-[var(--color-muted)] truncate">{r.shipping}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-poppins text-sm font-bold text-[var(--color-headline)]">
                    ${r.price.toLocaleString()}
                  </p>
                  <p className="font-mono text-[9px] text-[var(--color-muted)]">
                    {r.cryptoPrice?.toLocaleString()} {r.cryptoSymbol}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
