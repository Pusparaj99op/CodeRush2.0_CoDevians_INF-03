"use client";

import {
  LinkSimple,
  ShoppingCart,
  Sparkle,
  CheckCircle,
  Tag,
  ArrowRight,
  DeviceMobile,
  Laptop,
  Suitcase,
  Globe,
  Lightning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { extractProductFromUrl, type ExtractedProduct } from "@/lib/product-scraper";

interface UrlProductScannerProps {
  onPlanProduct?: (goalText: string, budgetAlgo: number) => void;
}

const SAMPLE_URLS = [
  {
    label: "Apple iPhone 15 Pro Max",
    url: "https://www.apple.com/shop/buy-iphone/iphone-15-pro",
  },
  {
    label: "Samsung Galaxy S24 Ultra",
    url: "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
  },
  {
    label: "Sony WH-1000XM5 Headphones",
    url: "https://www.amazon.com/dp/B09XS7JWHH/sony-wh1000xm5-noise-canceling",
  },
];

export function UrlProductScanner({ onPlanProduct }: UrlProductScannerProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ExtractedProduct | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleScan(urlToScan?: string) {
    const url = urlToScan ?? inputUrl;
    if (!url.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const product = extractProductFromUrl(url);
      setScannedProduct(product);
      setAnalyzing(false);
    }, 400);
  }

  function handleLaunchWorkflow() {
    if (!scannedProduct) return;
    const goalText = `Procure product from URL (${scannedProduct.url}): ${scannedProduct.title} from ${scannedProduct.storeName}`;
    if (onPlanProduct) {
      onPlanProduct(goalText, scannedProduct.estimatedPriceAlgo);
    } else {
      window.dispatchEvent(
        new CustomEvent("veldar:fill-goal", {
          detail: {
            goal: goalText,
            budgetAlgo: scannedProduct.estimatedPriceAlgo,
          },
        })
      );
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-500/10 text-sky-400">
            <LinkSimple size={18} weight="bold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-headline)]">
              E-Commerce Product URL Scanner
            </h3>
            <p className="text-[11px] text-[var(--color-muted)]">
              Paste any product URL (Smartphones, Travel Tech, Gear) for instant autonomous procurement
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
          URL Auto-Discovery
        </span>
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="Paste product link (e.g. https://www.apple.com/shop/buy-iphone/...)"
            className="w-full rounded-xl border border-[var(--color-border)] bg-transparent py-2.5 pl-3.5 pr-10 text-xs text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          />
          {inputUrl && (
            <button
              onClick={() => {
                setInputUrl("");
                setScannedProduct(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => handleScan()}
          disabled={!inputUrl.trim() || analyzing}
          className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-sky-400 active:scale-[0.98] disabled:opacity-50"
        >
          {analyzing ? (
            <span>Extracting...</span>
          ) : (
            <>
              <Sparkle size={14} />
              <span>Inspect URL</span>
            </>
          )}
        </button>
      </div>

      {/* Preset sample buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-[var(--color-muted)]">Try pasting:</span>
        {SAMPLE_URLS.map((sample) => (
          <button
            key={sample.label}
            onClick={() => {
              setInputUrl(sample.url);
              handleScan(sample.url);
            }}
            className="rounded-full border border-[var(--color-border)] bg-white/[0.02] px-3 py-1 text-[11px] font-medium text-[var(--color-body)] transition-colors hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-300"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Product Discovery Result Card */}
      {scannedProduct && (
        <div className="mt-2 flex flex-col gap-4 rounded-xl border border-sky-500/30 bg-sky-500/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
                {scannedProduct.category === "smartphone" ? (
                  <DeviceMobile size={22} />
                ) : scannedProduct.category === "laptop" ? (
                  <Laptop size={22} />
                ) : scannedProduct.category === "travel_gear" ? (
                  <Suitcase size={22} />
                ) : (
                  <ShoppingCart size={22} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                    {scannedProduct.storeName}
                  </span>
                  {scannedProduct.badge && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      {scannedProduct.badge}
                    </span>
                  )}
                </div>
                <h4 className="mt-1 text-sm font-semibold text-[var(--color-headline)]">
                  {scannedProduct.title}
                </h4>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${scannedProduct.estimatedPriceUsd} USD
              </span>
              <span className="text-[11px] font-mono text-[var(--color-accent)]">
                ≈ {scannedProduct.estimatedPriceAlgo} ALGO / {scannedProduct.estimatedPriceXlm} XLM
              </span>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-black/40 p-3 text-xs">
            {Object.entries(scannedProduct.specs).map(([key, val]) => (
              <div key={key} className="flex flex-col">
                <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase">
                  {key}
                </span>
                <span className="text-[11px] font-medium text-[var(--color-headline)] truncate">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleLaunchWorkflow}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-cta)] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
          >
            <span>Auto-Plan Procurement with Veldar</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
