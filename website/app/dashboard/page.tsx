"use client";

// Web dashboard overview: mirrors the App's live trace/approval UI
// (Doc/specs/01-app.md) and doubles as the demo surface for the hackathon
// walkthrough (Doc/specs/02-website.md). Talks directly to the
// orchestrator API routes already implemented under app/api/**.

import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  Lightning,
  PlugsConnected,
  ShieldCheck,
  Sparkle,
  Spinner,
  Wallet,
  XCircle,
  CaretRight,
  Copy,
  Check,
  Planet,
  DeviceMobile,
  Compass,
  ShoppingCart,
  Airplane,
  Bed,
  Receipt,
  Truck,
  Package,
  Key,
  Laptop,
  Tag,
  LinkSimple,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { authedFetch, safeJson } from "@/lib/api-client";
import { UrlProductScanner } from "@/components/url-product-scanner";
import { X402InspectorModal } from "@/components/x402-inspector-modal";
import SpecularButton from "@/components/SpecularButton";
import { X402PipelineOverview } from "@/components/x402-pipeline-overview";
import { TravelMapPlanner } from "@/components/travel-map-planner";
import { CryptoPriceTicker } from "@/components/crypto-price-ticker";
import { WeatherPanel } from "@/components/weather-panel";
import { VoiceInputButton } from "@/components/voice-input-button";
import { FlightDisruptionPanel } from "@/components/flight-disruption-panel";
import { AgentActivityLog } from "@/components/agent-activity-log";
import { ItineraryCards } from "@/components/itinerary-cards";
import { PriceComparisonPanel } from "@/components/price-comparison-panel";
import { NftReceipt } from "@/components/nft-receipt";
import { useAuth } from "@/lib/auth-context";
import { connectLuteWallet, signPaymentWithLute } from "@/lib/lute-wallet";
import { connectFreighterWallet, signPaymentWithFreighter } from "@/lib/freighter-wallet";
import { connectMetaMask, signPaymentWithMetaMask } from "@/lib/metamask-wallet";
import type { LedgerEvent, SupportedChain, Tier, Workflow, WorkflowStep } from "@/lib/types";
import { CurrencyConverter } from "@/components/currency-converter";
import { TravelRiskPanel } from "@/components/travel-risk-panel";
import { AgentNegotiationPanel } from "@/components/agent-negotiation";
import { SessionKeyPolicy } from "@/components/session-key-policy";
import { PackageTracker } from "@/components/package-tracker";
import { InvoiceSettlement } from "@/components/invoice-settlement";
import { LedgerEventStream } from "@/components/ledger-event-stream";

const TRAVEL_PRESETS = [
  {
    title: "Tokyo Trip & Tech Package",
    goal: "Book a trip to Tokyo with flights, hotel, local transit, and noise-canceling travel headphones under budget",
    budget: 1.0,
    icon: Compass,
    badge: "Full Itinerary",
  },
  {
    title: "Paris Cultural Week & Hotel",
    goal: "Book flight SFO to CDG, 5-night boutique hotel in Marais, museum pass, and high-speed rail ticket",
    budget: 1.5,
    icon: Airplane,
    badge: "Europe Travel",
  },
  {
    title: "Weekend Getaway & Flight Escrow",
    goal: "Reserve roundtrip flight to Miami, beachfront hotel, and parametric delay coverage",
    budget: 0.8,
    icon: Bed,
    badge: "Weekend Escrow",
  },
  {
    title: "Document Translation & Fact-Check",
    goal: "Translate itinerary documents and fact-check local travel rules via x402 marketplace",
    budget: 0.5,
    icon: FileText,
    badge: "x402 Micropay",
  },
];

const ECOMMERCE_PRESETS = [
  {
    title: "iPhone 15 Pro Max Procurement",
    goal: "Procure product from URL (https://apple.com/iphone-15-pro): Apple iPhone 15 Pro Max 256GB from Apple Store",
    budget: 0.5,
    icon: DeviceMobile,
    badge: "Hardware URL",
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    goal: "Procure product from URL (https://amazon.com/dp/B09XS7JWHH): Sony WH-1000XM5 Wireless Headphones",
    budget: 0.3,
    icon: ShoppingCart,
    badge: "Electronics",
  },
  {
    title: "M3 MacBook Pro 16-inch",
    goal: "Procure product from URL (https://apple.com/macbook-pro): Apple M3 Max MacBook Pro 16-inch 36GB RAM",
    budget: 1.2,
    icon: Laptop,
    badge: "High-Value",
  },
  {
    title: "Anker Travel Power Bank Kit",
    goal: "Procure product from URL (https://anker.com/powercore): Anker 737 Power Bank & USB-C Fast Charger",
    budget: 0.2,
    icon: Tag,
    badge: "Tech Gear",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"travel" | "ecommerce">("travel");
  const [showInspector, setShowInspector] = useState(false);
  // Shared state lifted for workflow panel awareness
  const [lastSubmittedGoal, setLastSubmittedGoal] = useState("");
  const [workflowActive, setWorkflowActive] = useState(false);
  const [travelOrigin, setTravelOrigin] = useState("Mumbai, India");
  const [travelDest, setTravelDest] = useState("Tokyo, Japan");
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number; name: string } | null>(null);


  return (
    <>
      <X402InspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        walletAddress={user?.email}
        workflowName={activeTab === "travel" ? "Travel Orchestrator" : "E-Commerce Orchestrator"}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--color-headline)] sm:text-4xl">
            Welcome, {user?.displayName ?? "Agent Master"}.
          </h1>
          <p className="font-poppins text-sm text-[var(--color-body)] leading-relaxed">
            Autonomous multi-agent orchestration for travel bookings and e-commerce procurement settled on Algorand.
          </p>
        </div>

        <SpecularButton
          onClick={() => setShowInspector(true)}
          size="md"
          radius={9999}
          tint="#ff5228"
          tintOpacity={0.15}
          lineColor="#ff7a59"
          baseColor="#ff5228"
          autoAnimate={true}
        >
          <Lightning size={16} weight="fill" />
          <span>Inspect x402 Payment Pipeline</span>
        </SpecularButton>
      </div>

      {/* Live Agent Analytics Metrics Bar */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-muted)]">Active Workflows</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-headline)]">3 Active</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-400">100% On-Chain Health</p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-muted)]">Total Settlement</span>
            <Coins size={16} className="text-[#ff5228]" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-[var(--color-headline)]">6.5 ALGO</p>
          <p className="mt-1 text-[11px] text-[var(--color-muted)]">Avg 0.001 ALGO fee/step</p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-muted)]">Execution Velocity</span>
            <Lightning size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-headline)]">1.4s / step</p>
          <p className="mt-1 text-[11px] font-medium text-amber-300">Sub-second TestNet finality</p>
        </div>

        <div
          onClick={() => setShowInspector(true)}
          className="group cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-sm transition-all hover:border-[#ff5228]/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-muted)]">x402 Facilitator</span>
            <ShieldCheck size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--color-headline)] flex items-center gap-1">
            <span>Operational</span>
            <span className="text-xs font-normal text-[#ff5228] underline ml-1">Inspect &rarr;</span>
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-400">Cryptographically Verified</p>
        </div>
      </div>

      {/* Live Crypto Price Ticker */}
      <div className="mt-6">
        <CryptoPriceTicker />
      </div>

      {/* Website-Native Live x402 Cryptographic Settlement Overview Section */}
      <div className="mt-4">
        <X402PipelineOverview
          walletAddress={user?.email}
          workflowName={activeTab === "travel" ? "Travel Orchestrator" : "E-Commerce Orchestrator"}
          amountAlgo={activeTab === "travel" ? 1.0 : 0.5}
        />
      </div>

      {/* Domain Tab Switcher */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-[var(--color-border)]/60 pb-4">
        <button
          onClick={() => setActiveTab("travel")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 font-poppins text-sm font-semibold transition-all ${
            activeTab === "travel"
              ? "bg-gradient-to-r from-[#ff4a1f] to-[#ff6b2e] text-white shadow-lg shadow-[#ff4a1f]/25"
              : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 text-[var(--color-muted)] hover:border-white/20 hover:text-[var(--color-headline)]"
          }`}
        >
          <Compass size={18} weight={activeTab === "travel" ? "fill" : "regular"} />
          <span>✈️ Travel Orchestrator</span>
        </button>

        <button
          onClick={() => setActiveTab("ecommerce")}
          className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 font-poppins text-sm font-semibold transition-all ${
            activeTab === "ecommerce"
              ? "bg-gradient-to-r from-[#ff4a1f] to-[#ff6b2e] text-white shadow-lg shadow-[#ff4a1f]/25"
              : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 text-[var(--color-muted)] hover:border-white/20 hover:text-[var(--color-headline)]"
          }`}
        >
          <ShoppingCart size={18} weight={activeTab === "ecommerce" ? "fill" : "regular"} />
          <span>🛍️ E-Commerce Orchestrator</span>
        </button>
      </div>

      {/* Travel Map Planner — full-width above form, only shown in Travel tab */}
      {activeTab === "travel" && (
        <div className="mt-8">
          <TravelMapPlanner
            onGoalGenerated={(generatedGoal, generatedBudget) => {
              window.dispatchEvent(
                new CustomEvent("veldar:fill-goal", {
                  detail: { goal: generatedGoal, budgetAlgo: generatedBudget },
                })
              );
            }}
            onOriginChange={(city) => setTravelOrigin(city)}
            onDestinationChange={(city, lat, lng) => {
              setTravelDest(city);
              setDestCoords({ lat, lng, name: city });
            }}
          />
        </div>
      )}

      {/* Destination Weather Panel — appears below map when destination is set */}
      {activeTab === "travel" && destCoords && (
        <div className="mt-4">
          <WeatherPanel lat={destCoords.lat} lng={destCoords.lng} cityName={destCoords.name} />
        </div>
      )}

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,390px)_1fr]">
        {user && activeTab === "travel" && (
          <TravelForm
            onWorkflowSubmit={(goal) => {
              setLastSubmittedGoal(goal);
              setWorkflowActive(true);
            }}
          />
        )}
        {user && activeTab === "ecommerce" && (
          <EcommerceForm
            onWorkflowSubmit={(goal) => {
              setLastSubmittedGoal(goal);
              setWorkflowActive(true);
            }}
          />
        )}
        <WorkflowPanel
          activeDomain={activeTab}
          lastGoal={lastSubmittedGoal}
          workflowActive={workflowActive}
          originCity={travelOrigin}
          destCity={travelDest}
        />
      </div>
    </>
  );
}

function TravelForm({ onWorkflowSubmit }: { onWorkflowSubmit?: (goal: string) => void }) {
  const [goal, setGoal] = useState("Book a trip to Tokyo with flights, hotel, and noise-canceling headphones under budget");
  const [budget, setBudget] = useState(1.0);
  const [tier, setTier] = useState<Tier>("free");
  const [chain, setChain] = useState<SupportedChain>("algorand");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draftGoal = localStorage.getItem("veldar:draft_goal");
    const draftBudget = localStorage.getItem("veldar:draft_budget");
    if (draftGoal) {
      setGoal(draftGoal);
      localStorage.removeItem("veldar:draft_goal");
    }
    if (draftBudget) {
      setBudget(Number(draftBudget));
      localStorage.removeItem("veldar:draft_budget");
    }

    function handleFillGoal(e: Event) {
      const detail = (e as CustomEvent<{ goal: string; budgetAlgo?: number }>).detail;
      if (detail.goal) setGoal(detail.goal);
      if (detail.budgetAlgo) setBudget(detail.budgetAlgo);
    }
    window.addEventListener("veldar:fill-goal", handleFillGoal);
    return () => window.removeEventListener("veldar:fill-goal", handleFillGoal);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authedFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({ goal, budgetAlgo: budget, tier, chain }),
      });
      const parsed = await safeJson(res);
      if (!parsed.ok || !parsed.data?.workflow) {
        throw new Error(parsed.error ?? "failed to create workflow");
      }
      window.dispatchEvent(new CustomEvent("veldar:workflow-created", { detail: parsed.data.workflow }));
      onWorkflowSubmit?.(goal);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-fit flex-col gap-6">
      {/* Travel Goal Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[var(--color-accent)]" />
            <h2 className="text-sm font-semibold text-[var(--color-headline)]">Travel Goal Submission</h2>
          </div>
          <div className="flex items-center gap-2">
            <VoiceInputButton onTranscript={(text) => setGoal(text)} disabled={submitting} />
            <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-accent)] uppercase">
              Travel Engine
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="travel-goal" className="text-xs font-semibold text-[var(--color-headline)]">
            Trip & Itinerary Description
          </label>
          <textarea
            id="travel-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="Describe your travel goal (destinations, dates, flights, hotel preferences)..."
            className="rounded-xl border border-[var(--color-border)] bg-transparent px-3.5 py-2.5 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
          />
        </div>

        {/* Live Travel Risk Panel */}
        <TravelRiskPanel destination={goal} />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="travel-budget" className="text-xs font-semibold text-[var(--color-headline)]">
              Max Budget
            </label>
            <input
              id="travel-budget"
              type="number"
              min={0.1}
              step={0.1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="rounded-xl border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="travel-chain" className="text-xs font-semibold text-[var(--color-headline)]">
              Payment Chain
            </label>
            <select
              id="travel-chain"
              value={chain}
              onChange={(e) => setChain(e.target.value as SupportedChain)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-headline)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              <option value="algorand">Algorand (Lute)</option>
              <option value="stellar">Stellar (Freighter)</option>
              <option value="ethereum">Ethereum Sepolia (MetaMask)</option>
            </select>
          </div>
        </div>

        {/* Live Currency Converter */}
        <CurrencyConverter amount={budget} base="algorand" label={`${budget} ALGO in real money`} />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <SpecularButton
          type="submit"
          disabled={submitting}
          size="lg"
          radius={9999}
          tint="#ff5228"
          tintOpacity={0.15}
          lineColor="#ff7a59"
          baseColor="#ff5228"
          autoAnimate={true}
          className="w-full mt-1"
        >
          {submitting ? (
            <>
              <Spinner size={16} className="animate-spin" />
              <span>Compiling Travel Itinerary...</span>
            </>
          ) : (
            <>
              <Sparkle size={16} />
              <span>Launch Travel Agent Workflow</span>
            </>
          )}
        </SpecularButton>
      </form>

      {/* Travel Web3 Features Status Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--color-headline)]">Travel Web3 Primitives Active</p>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            Algorand Smart Escrow
          </span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-[var(--color-body)]">
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Parametric Delay Insurance</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-300">Oracle Ready</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2">
              <Bed size={16} className="text-[var(--color-accent)]" />
              <span>Hotel Check-in Escrow</span>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-accent)]">Smart Contract</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-sky-400" />
              <span>Travel Pass ASA Credentials</span>
            </div>
            <span className="font-mono text-[10px] text-sky-300">Algorand NFT</span>
          </div>
        </div>
      </div>

      {/* Travel Quick Templates */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
        <p className="text-xs font-semibold text-[var(--color-headline)]">Quick Travel Templates</p>
        <div className="flex flex-col gap-2">
          {TRAVEL_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => {
                  setGoal(preset.goal);
                  setBudget(preset.budget);
                }}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)]/60 bg-white/[0.02] p-3 text-left transition-colors hover:border-[var(--color-accent)]/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--color-headline)]">{preset.title}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{preset.budget} ALGO max</p>
                  </div>
                </div>
                <CaretRight size={14} className="shrink-0 text-[var(--color-muted)] group-hover:text-[var(--color-headline)] transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Key Spending Policy */}
      <SessionKeyPolicy />

      {/* B2B Invoice Settlement */}
      <InvoiceSettlement />
    </div>
  );
}

function EcommerceForm({ onWorkflowSubmit }: { onWorkflowSubmit?: (goal: string) => void }) {
  const [goal, setGoal] = useState(
    "Procure product from URL (https://apple.com/iphone-15-pro): Apple iPhone 15 Pro Max 256GB from Apple Store"
  );
  const [budget, setBudget] = useState(0.5);
  const [chain, setChain] = useState<SupportedChain>("algorand");
  const [tier] = useState<Tier>("free");
  const [quantity, setQuantity] = useState(1);
  const [priorityShipping, setPriorityShipping] = useState(false);
  const [compareSuppliers, setCompareSuppliers] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const productName = goal.match(/:\s*(.+)/)?.[1]?.trim() ?? goal.split(" ").slice(0, 6).join(" ");
  const basePrice = budget > 0.8 ? 1199 : budget > 0.4 ? 599 : 199;
  const budgetUsedPct = Math.min(100, (budget / 2) * 100);
  const effectiveBudget = couponApplied ? +(budget * 0.9).toFixed(2) : budget;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await authedFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          goal: `[Qty: ${quantity}] ${goal}${priorityShipping ? " [Priority Shipping]" : ""}${compareSuppliers ? " [Multi-Supplier Compare]" : ""}`,
          budgetAlgo: effectiveBudget,
          tier,
          chain,
        }),
      });
      const parsed = await safeJson(res);
      if (!parsed.ok || !parsed.data?.workflow) {
        throw new Error(parsed.error ?? "failed to create workflow");
      }
      window.dispatchEvent(new CustomEvent("veldar:workflow-created", { detail: parsed.data.workflow }));
      setWorkflowSubmitted(true);
      onWorkflowSubmit?.(goal);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-fit flex-col gap-5">
      {/* URL Scanner */}
      <UrlProductScanner
        onPlanProduct={(scannedGoal, scannedBudget) => {
          setGoal(scannedGoal);
          setBudget(scannedBudget);
        }}
      />

      {/* Main Procurement Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
              <ShoppingCart size={22} className="text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-headline)]">E-Commerce Orchestrator</h2>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">AI agent · autonomous end-to-end purchasing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VoiceInputButton onTranscript={(text) => setGoal(text)} disabled={submitting} />
            <span className="rounded-full bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wide border border-sky-500/20">
              Shopping Engine
            </span>
          </div>
        </div>

        {/* Product Goal */}
        <div className="flex flex-col gap-3">
          <label htmlFor="ecom-goal" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Product / URL Prompt
          </label>
          <textarea
            id="ecom-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={4}
            placeholder="Paste a product URL or describe what to buy…"
            className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-5 py-4 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/25 resize-none leading-relaxed"
          />
        </div>

        {/* Budget + Chain */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="ecom-budget" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Max Budget
              </label>
              <span className="text-xs font-mono text-sky-400 font-semibold">{effectiveBudget} ALGO</span>
            </div>
            <input
              id="ecom-budget"
              type="number"
              min={0.1}
              step={0.1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-5 py-3.5 text-sm text-[var(--color-headline)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
            />
            {/* Budget meter */}
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${budgetUsedPct}%`,
                  background: budgetUsedPct > 75 ? "#f97316" : "#38bdf8",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="ecom-chain" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Payment Chain
            </label>
            <select
              id="ecom-chain"
              value={chain}
              onChange={(e) => setChain(e.target.value as SupportedChain)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-sm text-[var(--color-headline)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
            >
              <option value="algorand">Algorand (Lute)</option>
              <option value="stellar">Stellar (Freighter)</option>
              <option value="ethereum">Ethereum Sepolia (MetaMask)</option>
            </select>
          </div>
        </div>

        {/* Quantity + Options row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-2 py-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/10 hover:text-white transition-colors text-base font-bold"
            >−</button>
            <span className="w-9 text-center text-sm font-semibold text-[var(--color-headline)]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-white/10 hover:text-white transition-colors text-base font-bold"
            >+</button>
            <span className="pr-2 text-xs text-[var(--color-muted)] ml-1">qty</span>
          </div>

          {/* Priority Shipping toggle */}
          <button
            type="button"
            onClick={() => setPriorityShipping((p) => !p)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              priorityShipping
                ? "border-sky-400/60 bg-sky-500/15 text-sky-300"
                : "border-[var(--color-border)] bg-white/[0.02] text-[var(--color-muted)] hover:border-white/20 hover:text-[var(--color-headline)]"
            }`}
          >
            <Truck size={14} />
            Priority Shipping
          </button>

          {/* Compare Suppliers toggle */}
          <button
            type="button"
            onClick={() => setCompareSuppliers((c) => !c)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              compareSuppliers
                ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                : "border-[var(--color-border)] bg-white/[0.02] text-[var(--color-muted)] hover:border-white/20 hover:text-[var(--color-headline)]"
            }`}
          >
            <LinkSimple size={14} />
            Multi-Supplier Compare
          </button>
        </div>

        {/* Coupon Code */}
        <div className="flex gap-3">
          <input
            type="text"
            value={coupon}
            onChange={(e) => { setCoupon(e.target.value); setCouponApplied(false); }}
            placeholder="Coupon code (e.g. VELDAR10)"
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-5 py-3.5 text-sm text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
          />
          <button
            type="button"
            onClick={() => {
              if (coupon.trim()) setCouponApplied(true);
            }}
            className={`rounded-xl px-6 py-3.5 text-sm font-semibold transition-all ${
              couponApplied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:bg-sky-500/25"
            }`}
          >
            {couponApplied ? <><Check size={14} className="inline mr-1.5" />Applied 10%</> : "Apply"}
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400">
            {error}
          </p>
        )}

        <SpecularButton
          type="submit"
          disabled={submitting}
          size="lg"
          radius={9999}
          tint="#0284c7"
          tintOpacity={0.15}
          lineColor="#38bdf8"
          baseColor="#0284c7"
          autoAnimate={true}
          className="w-full"
        >
          {submitting ? (
            <>
              <Spinner size={16} className="animate-spin" />
              <span>Orchestrating Purchase…</span>
            </>
          ) : (
            <>
              <Sparkle size={16} />
              <span>Launch Procurement Agent</span>
            </>
          )}
        </SpecularButton>
      </form>

      {/* Web3 Primitives + Templates — side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Web3 Primitives */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--color-headline)]">Active Web3 Guards</p>
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
              On-Chain
            </span>
          </div>
          <div className="flex flex-col gap-2 text-xs text-[var(--color-body)]">
            {[
              { icon: Truck, label: "Carrier Oracle (FedEx/UPS)", badge: "Proof of Delivery", color: "text-sky-400" },
              { icon: Receipt, label: "Digital Receipt NFT", badge: "On-Chain ASA", color: "text-emerald-400" },
              { icon: Key, label: "Session Key Auto-Approve", badge: "<$100", color: "text-amber-400" },
              { icon: ShieldCheck, label: "Escrow Smart Contract", badge: "Locked", color: "text-violet-400" },
            ].map(({ icon: Icon, label, badge, color }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                  <Icon size={13} className={color} />
                  <span className="text-[11px]">{label}</span>
                </div>
                <span className={`font-mono text-[10px] ${color}`}>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Templates */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5">
          <p className="text-xs font-semibold text-[var(--color-headline)]">Quick Templates</p>
          <div className="flex flex-col gap-2">
            {ECOMMERCE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isActive = activePreset === preset.title;
              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => {
                    setGoal(preset.goal);
                    setBudget(preset.budget);
                    setActivePreset(preset.title);
                  }}
                  className={`group flex items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-all ${
                    isActive
                      ? "border-sky-400/50 bg-sky-500/10"
                      : "border-[var(--color-border)]/60 bg-white/[0.02] hover:border-sky-400/30 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${
                      isActive ? "bg-sky-500 text-white" : "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white"
                    }`}>
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-[var(--color-headline)]">{preset.title}</p>
                      <p className="text-[10px] text-[var(--color-muted)]">{preset.budget} ALGO</p>
                    </div>
                  </div>
                  <CaretRight size={12} className="shrink-0 text-[var(--color-muted)]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Comparison Panel */}
      <PriceComparisonPanel productName={productName} basePrice={basePrice} />

      {/* Live Currency Conversion */}
      <CurrencyConverter amount={effectiveBudget} base="algorand" label={`${effectiveBudget} ALGO budget`} />

      {/* Multi-Agent Supplier Negotiation */}
      <AgentNegotiationPanel product={productName} budget={effectiveBudget * 180} />

      {/* NFT Receipt after submission */}
      {workflowSubmitted && (
        <NftReceipt productName={productName} price={basePrice} />
      )}

      {/* Package Tracker after submission */}
      <PackageTracker productName={productName} workflowSubmitted={workflowSubmitted} />
    </div>
  );
}

function isEcommerceWorkflow(wf: Workflow): boolean {
  const goalLower = (wf.goal || "").toLowerCase();
  if (
    goalLower.includes("procure") ||
    goalLower.includes("iphone") ||
    goalLower.includes("macbook") ||
    goalLower.includes("sony") ||
    goalLower.includes("headphone") ||
    goalLower.includes("anker") ||
    goalLower.includes("product") ||
    goalLower.includes("qty:") ||
    goalLower.includes("url") ||
    goalLower.includes("buy") ||
    goalLower.includes("purchase") ||
    goalLower.includes("gear")
  ) {
    return true;
  }
  return (
    wf.steps?.some((s) =>
      ["laptop-inference", "carrier-oracle", "url-scanner", "procurement", "supplier-compare"].includes(s.providerId)
    ) ?? false
  );
}

function WorkflowPanel({
  activeDomain,
  lastGoal,
  workflowActive,
  originCity,
  destCity,
}: {
  activeDomain: "travel" | "ecommerce";
  lastGoal?: string;
  workflowActive?: boolean;
  originCity?: string;
  destCity?: string;
}) {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [allWorkflows, setAllWorkflows] = useState<Workflow[]>([]);
  const [trace, setTrace] = useState<LedgerEvent[]>([]);
  const [approving, setApproving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "events">("pipeline");

  async function refresh(id: string) {
    const [wfRes, traceRes] = await Promise.all([
      authedFetch(`/api/workflows/${id}`),
      authedFetch(`/api/workflows/${id}/trace`),
    ]);
    const wfParsed = await safeJson(wfRes);
    if (wfParsed.ok && wfParsed.data?.workflow) {
      setWorkflow(wfParsed.data.workflow);
    }
    const traceParsed = await safeJson(traceRes);
    if (traceParsed.ok && traceParsed.data?.trace) {
      setTrace(traceParsed.data.trace);
    }
  }

  // Load existing workflows on mount and select domain-matching workflow
  useEffect(() => {
    if (!user) return;
    authedFetch("/api/workflows")
      .then(async (res) => {
        const parsed = await safeJson(res);
        if (parsed.ok && parsed.data?.workflows) {
          const list: Workflow[] = parsed.data.workflows;
          setAllWorkflows(list);
          const domainMatch = list.find((w) =>
            activeDomain === "ecommerce" ? isEcommerceWorkflow(w) : !isEcommerceWorkflow(w)
          );
          const target = domainMatch ?? list[0];
          if (target) {
            setWorkflow(target);
            void refresh(target.id);
          }
        }
      })
      .catch(() => {});
  }, [user, activeDomain]);

  // When switching domain tabs, automatically switch to matching workflow
  useEffect(() => {
    if (allWorkflows.length === 0) return;
    const domainMatch = allWorkflows.find((w) =>
      activeDomain === "ecommerce" ? isEcommerceWorkflow(w) : !isEcommerceWorkflow(w)
    );
    if (domainMatch && domainMatch.id !== workflow?.id) {
      setWorkflow(domainMatch);
      void refresh(domainMatch.id);
    }
  }, [activeDomain, allWorkflows]);

  // Listen for newly created workflows
  useEffect(() => {
    function handleCreated(e: Event) {
      const wf = (e as CustomEvent<Workflow>).detail;
      setAllWorkflows((prev) => [wf, ...prev]);
      setWorkflow(wf);
      void refresh(wf.id);
    }
    window.addEventListener("veldar:workflow-created", handleCreated);
    return () => window.removeEventListener("veldar:workflow-created", handleCreated);
  }, []);

  const pendingApproval = workflow
    ? trace.find((e) => e.type === "approval_requested" && e.workflowId === workflow.id)
    : null;

  // Poll for updates while workflow is running or pending approval decision
  useEffect(() => {
    if (!workflow) return;
    if (workflow.status !== "running" && !pendingApproval) return;

    const timer = setInterval(() => {
      void refresh(workflow.id);
    }, 1200);

    return () => clearInterval(timer);
  }, [workflow, pendingApproval]);

  const [approvalError, setApprovalError] = useState<string | null>(null);

  async function approve(decision: "approved" | "denied", walletType: "lute" | "freighter" | "metamask" | "server" = "server") {
    if (!workflow || !pendingApproval) return;
    setApproving(decision);
    setApprovalError(null);
    try {
      const approvalId = pendingApproval.detail.approvalId as string;
      let luteTxnHash: string | undefined;

      if (decision === "approved" && walletType === "lute") {
        try {
          const savedLuteAddr = typeof window !== "undefined" ? localStorage.getItem("veldar:lute_address") : null;
          const luteAddr = savedLuteAddr ?? (await connectLuteWallet());
          const amountAlgo = (pendingApproval.detail.amountAlgo as number) ?? 1.0;
          const result = await signPaymentWithLute(
            luteAddr,
            "4SNSKGZL6TUKMZKJ3BELVCOXTZ653N2OVOKVWBLC26IGBNAAX35ZNW6HB4",
            amountAlgo
          );
          luteTxnHash = result.txnHash;
        } catch (luteErr) {
          setApprovalError((luteErr as Error).message);
          return;
        }
      } else if (decision === "approved" && walletType === "freighter") {
        try {
          const savedKey = typeof window !== "undefined" ? localStorage.getItem("veldar:freighter_key") : null;
          const pubKey = savedKey ?? (await connectFreighterWallet());
          const amountXlm = (pendingApproval.detail.amountAlgo as number) ?? 1.0;
          const result = await signPaymentWithFreighter(
            pubKey,
            "GBRPYHIL2CI3FNQ4BXLFMNDLFPPPU2HY523XYT6WL3L32T7MYW27L3R",
            amountXlm
          );
          luteTxnHash = result.txnHash;
        } catch (freighterErr) {
          setApprovalError((freighterErr as Error).message);
          return;
        }
      } else if (decision === "approved" && walletType === "metamask") {
        try {
          const savedAddr = typeof window !== "undefined" ? localStorage.getItem("veldar:metamask_address") : null;
          const conn = savedAddr ? { address: savedAddr } : await connectMetaMask();
          const amountEth = (pendingApproval.detail.amountAlgo as number) ?? 0.05;
          const result = await signPaymentWithMetaMask(
            conn.address,
            "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            amountEth
          );
          luteTxnHash = result.txnHash;
        } catch (metaMaskErr) {
          setApprovalError((metaMaskErr as Error).message);
          return;
        }
      }

      await authedFetch(`/api/workflows/${workflow.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approvalId, decision, luteTxnHash }),
      });
      await refresh(workflow.id);
    } catch (err) {
      setApprovalError((err as Error).message);
    } finally {
      setApproving(null);
    }
  }

  if (!workflow) {
    return (
      <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] p-12 text-center bg-[var(--color-bg-elevated)]/50">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl mb-4 ${
          activeDomain === "travel" ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : "bg-sky-500/10 text-sky-400"
        }`}>
          {activeDomain === "travel" ? <Compass size={24} /> : <ShoppingCart size={24} />}
        </div>
        <h3 className="text-base font-semibold text-[var(--color-headline)]">
          No Active {activeDomain === "travel" ? "Travel" : "E-Commerce"} Workflow
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[var(--color-muted)] leading-relaxed">
          Select a quick template or submit a goal on the left to watch Veldar assemble providers, quote pricing, request approvals, and settle payments.
        </p>
      </div>
    );
  }

  const spendPercent = Math.min(100, Math.round((workflow.spentAlgo / (workflow.budgetAlgo || 1)) * 100));

  return (
    <>
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
              workflow.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : workflow.status === "running"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 animate-pulse"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}>
              {workflow.status === "running" && <Spinner size={12} className="animate-spin" />}
              {workflow.status}
            </span>
            <span className="text-xs font-mono text-[var(--color-muted)]">ID: {workflow.id.slice(0, 8)}...</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-[var(--color-headline)]">{workflow.goal}</h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/trace/${workflow.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[var(--color-headline)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <span>Replay Trace</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Budget & Spend Gauge */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-[var(--color-border)]/70 bg-white/[0.02] p-4">
        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Spent / Budget</p>
          <p className="mt-1 text-base font-bold font-mono text-[var(--color-headline)]">
            {workflow.spentAlgo.toFixed(2)} / {workflow.budgetAlgo} <span className="text-xs font-sans font-normal text-[var(--color-accent)]">MAX</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
              style={{ width: `${spendPercent}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Pipeline Steps</p>
          <p className="mt-1 text-base font-bold font-mono text-[var(--color-headline)]">
            {workflow.steps?.filter((s) => s.status === "fulfilled").length || 0} / {workflow.steps?.length || 0} <span className="text-xs font-sans font-normal text-emerald-400">Completed</span>
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">Settlement Network</p>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Algorand & Stellar Multi-Chain TestNet</span>
          </div>
        </div>
      </div>

      {/* Pending Approval Callout Banner */}
      {pendingApproval && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-400 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider">Action Required: Human Approval Requested</p>
            </div>
            <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
              {(pendingApproval.detail.amountAlgo as number) ?? 1.0}
            </span>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed">
            Provider <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-amber-300">{String(pendingApproval.detail.providerId ?? "Provider")}</code> requested approval for: &ldquo;{String(pendingApproval.detail.reason ?? "Execute next workflow step")}&rdquo;.
          </p>

          {approvalError && (
            <div className="flex flex-col gap-2 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-xs text-red-200">
              <p className="font-semibold text-red-300">Wallet Signing Notice:</p>
              <p className="text-[11px] leading-relaxed">{approvalError}</p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => approve("approved", "server")}
                  disabled={approving !== null}
                  className="rounded-full bg-[var(--color-cta)] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[var(--color-cta-hover)]"
                >
                  Proceed with Veldar Server Settlement
                </button>
              </div>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => approve("approved", "metamask")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/30 disabled:opacity-50"
            >
              <Lightning size={14} className="text-amber-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with MetaMask"}</span>
            </button>

            <button
              onClick={() => approve("approved", "freighter")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/30 disabled:opacity-50"
            >
              <Planet size={14} className="text-sky-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with Freighter Wallet"}</span>
            </button>

            <button
              onClick={() => approve("approved", "lute")}
              disabled={approving !== null}
              className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:opacity-50"
            >
              <Wallet size={14} className="text-emerald-400" />
              <span>{approving === "approved" ? "Signing..." : "Approve with Lute Wallet"}</span>
            </button>

            <button
              onClick={() => approve("approved", "server")}
              disabled={approving !== null}
              className="rounded-full bg-[var(--color-cta)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-cta-hover)] disabled:opacity-50"
            >
              Approve {(pendingApproval.detail.amountAlgo as number) ?? ""}
            </button>

            <button
              onClick={() => approve("denied")}
              disabled={approving !== null}
              className="rounded-full border border-[var(--color-border)] bg-black/30 px-4 py-2 text-xs font-semibold text-[var(--color-headline)] transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "pipeline"
              ? "border-[var(--color-accent)] text-[var(--color-headline)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-headline)]"
          }`}
        >
          Pipeline Steps ({workflow.steps?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "events"
              ? "border-[var(--color-accent)] text-[var(--color-headline)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-headline)]"
          }`}
        >
          Ledger Event Stream ({trace.length})
        </button>
      </div>

      {/* Tab 1: Pipeline Steps Cards */}
      {activeTab === "pipeline" && (
        <div className="flex flex-col gap-3">
          {(!workflow.steps || workflow.steps.length === 0) && (
            <p className="py-6 text-center text-xs text-[var(--color-muted)]">Compiling workflow steps...</p>
          )}

          {workflow.steps?.map((step, idx) => (
            <StepCard key={step.id || idx} step={step} index={idx} />
          ))}
        </div>
      )}

      {/* Tab 2: Ledger Events Audit Stream */}
      {activeTab === "events" && <LedgerEventStream trace={trace} />}
    </div>

    {/* Agent Activity Log — shown when workflow is active */}
    <AgentActivityLog
      domain={activeDomain}
      goal={lastGoal ?? (activeDomain === "ecommerce" ? "Procure product" : "Book a trip")}
      active={!!workflowActive}
    />

    {/* Flight Disruption + Parametric Insurance */}
    {activeDomain === "travel" && (
      <FlightDisruptionPanel
        originCity={originCity}
        destCity={destCity}
        active={!!workflowActive}
      />
    )}

    {/* AI Itinerary Cards */}
    {activeDomain === "travel" && workflowActive && (
      <ItineraryCards
        origin={originCity ?? "Mumbai"}
        destination={destCity ?? "Tokyo"}
        nights={5}
      />
    )}
    </>
  );
}

function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  const isFulfilled = step.status === "fulfilled";
  const isAwaiting = step.status === "awaiting_approval";
  const isFailed = step.status === "failed";

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${
      isFulfilled
        ? "border-emerald-500/30 bg-emerald-500/[0.02]"
        : isAwaiting
        ? "border-amber-500/40 bg-amber-500/[0.03]"
        : isFailed
        ? "border-red-500/30 bg-red-500/[0.02]"
        : "border-[var(--color-border)] bg-white/[0.01]"
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-bold text-[var(--color-headline)]">
            {index + 1}
          </span>
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-headline)]">{step.description}</h4>
            <p className="text-[11px] font-mono text-[var(--color-muted)]">Provider: {step.providerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
            isFulfilled
              ? "bg-emerald-500/15 text-emerald-300"
              : isAwaiting
              ? "bg-amber-500/15 text-amber-300"
              : isFailed
              ? "bg-red-500/15 text-red-300"
              : "bg-white/10 text-[var(--color-muted)]"
          }`}>
            {step.status.replace(/_/g, " ")}
          </span>

          {step.quotedPriceAlgo !== null && (
            <span className="font-mono text-xs font-semibold text-[var(--color-accent)]">
              {step.settledPriceAlgo ?? step.quotedPriceAlgo} ALGO
            </span>
          )}
        </div>
      </div>

      {/* Deliverable Output Box */}
      {step.output && (
        <div className="mt-1 rounded-lg border border-[var(--color-border)]/60 bg-black/40 p-3">
          <p className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">Step Deliverable Output</p>
          <p className="text-xs text-[var(--color-headline)] font-sans leading-relaxed whitespace-pre-wrap">{step.output}</p>
        </div>
      )}
    </div>
  );
}
