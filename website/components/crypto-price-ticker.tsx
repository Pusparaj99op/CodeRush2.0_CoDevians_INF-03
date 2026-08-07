"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "@phosphor-icons/react";

interface PriceData {
  usd: number;
  prev?: number;
}

interface Prices {
  algorand: PriceData;
  stellar: PriceData;
  ethereum: PriceData;
}

const COIN_IDS = "algorand,stellar,ethereum";

export function CryptoPriceTicker() {
  const [prices, setPrices] = useState<Prices>({
    algorand: { usd: 0.18 },
    stellar: { usd: 0.11 },
    ethereum: { usd: 3200 },
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const prevRef = useRef<Prices>(prices);

  async function fetchPrices() {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS}&vs_currencies=usd`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setPrices((prev) => {
        prevRef.current = prev;
        return {
          algorand: { usd: data.algorand?.usd ?? prev.algorand.usd, prev: prev.algorand.usd },
          stellar: { usd: data.stellar?.usd ?? prev.stellar.usd, prev: prev.stellar.usd },
          ethereum: { usd: data.ethereum?.usd ?? prev.ethereum.usd, prev: prev.ethereum.usd },
        };
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // silently fail — keep previous values
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 45_000); // refresh every 45s
    return () => clearInterval(interval);
  }, []);

  const coins = [
    { key: "algorand" as const, symbol: "ALGO", color: "text-[#00b4d8]", bg: "bg-[#00b4d8]/10 border-[#00b4d8]/20" },
    { key: "stellar" as const, symbol: "XLM", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { key: "ethereum" as const, symbol: "ETH", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  ];

  function formatPrice(p: PriceData, key: "algorand" | "stellar" | "ethereum") {
    const val = p.usd;
    if (key === "ethereum") return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return `$${val.toFixed(4)}`;
  }

  function getDirection(p: PriceData) {
    if (!p.prev) return "flat";
    if (p.usd > p.prev) return "up";
    if (p.usd < p.prev) return "down";
    return "flat";
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5">
      <span className="font-inter text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] mr-1">
        Live Prices
      </span>
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-[var(--color-cta)] border-t-transparent animate-spin" />
      ) : (
        coins.map(({ key, symbol, color, bg }) => {
          const p = prices[key];
          const dir = getDirection(p);
          return (
            <div
              key={key}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${bg}`}
            >
              <span className={`font-inter text-[11px] font-bold ${color}`}>{symbol}</span>
              <span className="font-inter text-[11px] font-semibold text-[var(--color-headline)]">
                {formatPrice(p, key)}
              </span>
              {dir === "up" && <ArrowUp size={10} className="text-emerald-400" weight="bold" />}
              {dir === "down" && <ArrowDown size={10} className="text-red-400" weight="bold" />}
              {dir === "flat" && <Minus size={10} className="text-[var(--color-muted)]" weight="bold" />}
            </div>
          );
        })
      )}
      {lastUpdated && (
        <span className="ml-auto font-inter text-[10px] text-[var(--color-muted)]">
          Updated {lastUpdated}
        </span>
      )}
    </div>
  );
}
