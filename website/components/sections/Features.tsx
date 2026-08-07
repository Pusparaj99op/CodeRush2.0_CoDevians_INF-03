"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GitBranch, Coins, ShieldCheck } from "@phosphor-icons/react";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Step-Graph Planning",
    detail:
      "Veldar receives a plain-language goal and compiles it into a directed step-graph with conditional fallback edges and skip logic baked in.",
  },
  {
    icon: Coins,
    title: "Micro-Payment Rail",
    detail:
      "Marketplace providers quote exact or upto pricing. Payments settle step-by-step through Algorand, Stellar, or Ethereum Sepolia x402 facilitators.",
  },
  {
    icon: ShieldCheck,
    title: "Approval Gates",
    detail:
      "Anything above your per-step cap or from an unverified provider pauses automatically. You inspect and approve every quote before funds move.",
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      cards.forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          y: 50,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: "power3.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 lg:py-32 border-b border-[#D8D4CE]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Eyebrow & Section Tag */}
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● VELDAR MECHANICS</div>
          <span className="section-tag">(VLD — 01)</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-tight text-[#1A1916] mb-16">
          Architected for <span className="italic font-normal text-[#C9A84C]">verifiable</span> agentic execution.
        </h2>

        {/* 3-Column Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="feature-card flex flex-col justify-between rounded-2xl border border-[#D8D4CE] bg-[#EDEAE5] p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1916] text-[#C9A84C]">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#1A1916] mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm font-light text-[#6B6660] leading-relaxed">
                    {feat.detail}
                  </p>
                </div>
                <div className="mt-8 font-mono text-xs text-[#B5B1AB]">
                  0{i + 1} / MECHANICS
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
