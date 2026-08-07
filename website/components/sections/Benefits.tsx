"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BENEFITS = [
  {
    num: "01",
    title: "Your budget is a hard ceiling",
    detail:
      "Set a cap per step or per run. Veldar pays nothing above it without your explicit human approval.",
  },
  {
    num: "02",
    title: "Every token is accounted for",
    detail:
      "Receipts are written to a ledger after each payment. Nothing is assumed, hidden, or estimated.",
  },
  {
    num: "03",
    title: "Replay any run, any time",
    detail:
      "The full trace — offers, approvals, payments, and results — is stored and replayable end-to-end.",
  },
  {
    num: "04",
    title: "Cancel mid-run, keep what's done",
    detail:
      "Stop a workflow at any step. Completed steps are settled and retained. Nothing is lost.",
  },
  {
    num: "05",
    title: "Unrecognized providers always need your OK",
    detail:
      "Veldar never routes to an unrecognized service without surfacing a quote and waiting for approval.",
  },
  {
    num: "06",
    title: "No custody, no escrow black holes",
    detail:
      "Payments settle directly on Algorand, Stellar, or Sepolia TestNets. Veldar never holds your tokens.",
  },
];

export function Benefits() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".benefit-item");
      items.forEach((item) => {
        const rule = item.querySelector(".benefit-rule");
        const text = item.querySelector(".benefit-text");

        const tl = gsap.timeline({
          scrollTrigger: { trigger: item, start: "top 85%" },
        });

        if (rule) {
          tl.from(rule, {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.5,
            ease: "power2.out",
          });
        }

        if (text) {
          tl.from(
            text,
            { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" },
            "-=0.2"
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 lg:py-32 border-b border-[#D8D4CE]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● VELDAR PRINCIPLES</div>
          <span className="section-tag">(VLD — 03)</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-[#1A1916] mb-16">
          Veldar with <span className="italic font-normal text-[#C9A84C]">no black boxes.</span>
        </h2>

        {/* 6 Numbered Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {BENEFITS.map((item) => (
            <div key={item.num} className="benefit-item flex flex-col gap-4">
              <div className="benefit-rule hr-editorial" />
              <div className="benefit-text flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#C9A84C]">
                    ({item.num})
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#1A1916]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm font-light text-[#6B6660] leading-relaxed pl-8">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
