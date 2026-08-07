"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Sparkle, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free Tier",
    price: "$0",
    period: "/month",
    cap: "0.5 ALGO / XLM cap per step",
    cut: "2.5% platform cut",
    features: [
      "All payments above 0.5 cap require approval",
      "Full interactive trace history & replay",
      "Cancel workflow at any step",
      "Algorand, Stellar & Sepolia settlement",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "/month",
    cap: "5.0 ALGO / XLM cap per step",
    cut: "Reduced 1% cut",
    features: [
      "Higher 5.0 per-step approval ceiling",
      "New-provider quote approval triggers",
      "Priority execution queue",
      "Full interactive trace history & replay",
      "Unlimited workflow cancellations",
    ],
    cta: "Choose Pro",
    popular: true,
  },
  {
    id: "promax",
    name: "ProMax",
    price: "$39",
    period: "/month",
    cap: "Unlimited (No per-step cap)",
    cut: "0% platform cut",
    features: [
      "Unlimited per-step execution cap",
      "Zero platform transaction fees",
      "Policy-exception notifications only",
      "Unlimited concurrent agent pipelines",
      "Dedicated priority queue & full trace",
    ],
    cta: "Choose ProMax",
    popular: false,
  },
];

export function PricingSection() {
  const [activeTab, setActiveTab] = useState<"free" | "pro" | "promax">("pro");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".price-card", {
        scrollTrigger: { trigger: ".pricing-section", start: "top 75%" },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "expo.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={containerRef}
      className="pricing-section py-24 lg:py-32 border-b border-[#D8D4CE] bg-[#EDEAE5]"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● TRANSPARENT PRICING</div>
          <span className="section-tag">(VLD — 04)</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-[#1A1916]">
            Subscription <span className="italic font-normal text-[#C9A84C]">plans & caps.</span>
          </h2>

          {/* Tab Controls */}
          <div className="flex items-center rounded-full border border-[#D8D4CE] bg-[#F5F3F0] p-1.5 shadow-inner">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActiveTab(plan.id as "free" | "pro" | "promax")}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                  activeTab === plan.id
                    ? "bg-[#1A1916] text-[#F5F3F0] shadow-sm"
                    : "text-[#6B6660] hover:text-[#1A1916]"
                }`}
              >
                {plan.name} {plan.popular && "★"}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-cards grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isSelected = activeTab === plan.id;
            return (
              <div
                key={plan.id}
                className={`price-card relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  isSelected
                    ? "border-2 border-[#1A1916] bg-[#FAFAF8] shadow-xl -translate-y-2"
                    : "border border-[#D8D4CE] bg-[#F5F3F0] opacity-95 hover:opacity-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 right-8 flex items-center gap-1 rounded-full bg-[#C9A84C] px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1916] shadow-sm">
                    <Sparkle size={12} weight="fill" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#1A1916]">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-mono text-5xl font-bold text-[#1A1916]">
                      {plan.price}
                    </span>
                    <span className="font-mono text-xs text-[#6B6660]">{plan.period}</span>
                  </div>

                  <div className="mt-6 flex flex-col gap-1 rounded-xl bg-[#EDEAE5] p-3 text-xs font-mono">
                    <span className="font-bold text-[#1A1916]">{plan.cap}</span>
                    <span className="text-[#6B6660]">{plan.cut}</span>
                  </div>

                  <ul className="mt-8 flex flex-col gap-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-[#2D2B27]">
                        <Check size={16} className="mt-0.5 shrink-0 text-[#2E6B4F]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10">
                  <Link
                    href="/dashboard"
                    className={`flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1A1916] text-[#F5F3F0] hover:bg-[#383530]"
                        : "border border-[#1A1916] bg-transparent text-[#1A1916] hover:bg-[#EDEAE5]"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
