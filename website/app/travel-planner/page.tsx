"use client";

import {
  Airplane,
  Bed,
  Briefcase,
  Coins,
  Compass,
  DeviceMobile,
  Globe,
  Lightning,
  Planet,
  ShieldCheck,
  Sparkle,
  Suitcase,
  Wallet,
  ArrowRight,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { UrlProductScanner } from "@/components/url-product-scanner";
import { useRouter } from "next/navigation";

interface ExpenseItem {
  id: string;
  name: string;
  category: "flight" | "hotel" | "activity" | "tech_gear" | "other";
  amountAlgo: number;
  amountXlm: number;
  url?: string;
}

export default function TravelPlannerPage() {
  const router = useRouter();

  const [destination, setDestination] = useState("Tokyo, Japan");
  const [durationDays, setDurationDays] = useState(5);
  const [items, setItems] = useState<ExpenseItem[]>([
    {
      id: "1",
      name: "Roundtrip Flight (San Francisco -> Haneda)",
      category: "flight",
      amountAlgo: 0.2,
      amountXlm: 16.0,
    },
    {
      id: "2",
      name: "Luxury Boutique Hotel (Shinjuku - 5 Nights)",
      category: "hotel",
      amountAlgo: 0.15,
      amountXlm: 12.0,
    },
    {
      id: "3",
      name: "Travel Tech: iPhone 15 Pro Max 256GB",
      category: "tech_gear",
      amountAlgo: 0.5,
      amountXlm: 40.0,
      url: "https://www.apple.com/iphone-15-pro",
    },
    {
      id: "4",
      name: "Tokyo Rail Pass & Guided Cultural Tours",
      category: "activity",
      amountAlgo: 0.05,
      amountXlm: 4.0,
    },
  ]);

  const totalAlgo = items.reduce((sum, item) => sum + item.amountAlgo, 0);
  const totalXlm = items.reduce((sum, item) => sum + item.amountXlm, 0);

  function handleProductFromScanner(goalText: string, budgetAlgo: number) {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: goalText.replace(/^Procure product from URL \([^)]+\): /, ""),
      category: "tech_gear",
      amountAlgo: budgetAlgo,
      amountXlm: Number((budgetAlgo * 80).toFixed(2)),
    };
    setItems((prev) => [...prev, newItem]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function launchWorkflow() {
    const fullGoal = `Book trip to ${destination} for ${durationDays} days including: ${items.map((i) => i.name).join("; ")}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("veldar:draft_goal", fullGoal);
      localStorage.setItem("veldar:draft_budget", totalAlgo.toString());
    }
    router.push("/dashboard");
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-12 pb-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-3 text-center max-w-3xl mx-auto mb-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Compass size={28} />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[var(--color-headline)] sm:text-5xl">
              Travel Expense & E-Commerce Planner
            </h1>
            <p className="text-base leading-relaxed text-[var(--color-body)]">
              Plan complete travel itineraries and e-commerce tech procurement in one unified budget. Settle bookings and hardware purchases automatically via Algorand or Stellar x402 payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Planner Controls & URL Scanner */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              {/* Trip Metadata Card */}
              <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--color-headline)]">Trip Parameters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-headline)]">Destination</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="rounded-xl border border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-headline)]">Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="rounded-xl border border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Embedded URL Product Scanner for E-Commerce Tech */}
              <UrlProductScanner onPlanProduct={handleProductFromScanner} />
            </div>

            {/* Right Column: Expense Budget Summary */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-headline)]">Budget Summary</h3>
                    <p className="text-xs text-[var(--color-muted)]">{items.length} Planned Items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-mono text-[var(--color-accent)]">
                      {totalAlgo.toFixed(2)} ALGO
                    </p>
                    <p className="text-xs font-mono text-sky-400">
                      ≈ {totalXlm.toFixed(1)} XLM
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)]/60 bg-white/[0.02] p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[var(--color-headline)]">
                          {item.category === "flight" ? (
                            <Airplane size={16} />
                          ) : item.category === "hotel" ? (
                            <Bed size={16} />
                          ) : item.category === "tech_gear" ? (
                            <DeviceMobile size={16} className="text-sky-400" />
                          ) : (
                            <Suitcase size={16} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[var(--color-headline)]">{item.name}</p>
                          <p className="text-[10px] text-[var(--color-muted)] capitalize">{item.category.replace("_", " ")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-semibold text-[var(--color-headline)]">
                          {item.amountAlgo} ALGO
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--color-muted)] hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <button
                  onClick={launchWorkflow}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[var(--color-cta)] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-cta-hover)] active:scale-[0.98]"
                >
                  <Sparkle size={18} />
                  <span>Launch Autonomous Agent Workflow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
