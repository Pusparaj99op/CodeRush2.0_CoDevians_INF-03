"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { Plus, Minus } from "@phosphor-icons/react";

const SERVICES = [
  {
    num: "1",
    title: "Planning & Compilation",
    summary:
      "Veldar receives a plain-language goal and budget, then compiles it into a step graph with conditions for what can be skipped or retried.",
    bullets: [
      "Plain-language goal ingestion",
      "Deterministic step-graph compilation",
      "Conditional skip & fallback logic",
      "Tier-based budget allocation",
    ],
  },
  {
    num: "2",
    title: "Shopping & x402 Payment",
    summary:
      "Each provider in the marketplace quotes a price. Veldar pays through the x402 facilitator as each step clears.",
    bullets: [
      "Marketplace quote aggregation",
      "x402 Algorand, Stellar & Ethereum facilitators",
      "Per-step micropayment execution",
      "On-chain receipts and proof-of-work",
    ],
  },
  {
    num: "3",
    title: "Verification & Ledger Replay",
    summary:
      "Every offer, approval, payment, and result is written to a ledger. Runs are replayable end-to-end with zero black boxes.",
    bullets: [
      "Per-event ledger record writes",
      "Human approval gate pauses",
      "Full interactive trace history",
      "End-to-end run replay",
    ],
  },
];

export function ServicesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);

  function togglePanel(index: number) {
    const current = openIndex;
    const isOpening = current !== index;

    if (current !== null && panelsRef.current[current]) {
      const prevEl = panelsRef.current[current]!;
      gsap.to(prevEl, {
        height: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onStart: () => {
          prevEl.style.overflow = "hidden";
        },
      });
    }

    if (isOpening && panelsRef.current[index]) {
      const nextEl = panelsRef.current[index]!;
      gsap.set(nextEl, { height: "auto" });
      gsap.from(nextEl, {
        height: 0,
        duration: 0.55,
        ease: "power2.inOut",
        onStart: () => {
          nextEl.style.overflow = "hidden";
        },
        onComplete: () => {
          nextEl.style.overflow = "visible";
        },
      });
      setOpenIndex(index);
    } else {
      setOpenIndex(null);
    }
  }

  return (
    <section id="how-it-works" className="py-24 lg:py-32 border-b border-[#D8D4CE]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● HOW VELDAR OPERATES</div>
          <span className="section-tag">(VLD — 02)</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4.5rem)] font-light text-[#1A1916] mb-16">
          Three phases of <span className="italic font-normal text-[#C9A84C]">agentic commerce.</span>
        </h2>

        {/* Accordion Rows */}
        <div className="flex flex-col border-t border-[#D8D4CE]">
          {SERVICES.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.num} className="border-b border-[#D8D4CE] py-6">
                <button
                  onClick={() => togglePanel(i)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-2xl font-light text-[#C9A84C]">
                      0{item.num}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-medium text-[#1A1916]">
                      {item.title}
                    </h3>
                  </div>

                  <div className="grid h-10 w-10 place-items-center rounded-full border border-[#D8D4CE] text-[#1A1916] transition-transform duration-300">
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>

                <div
                  ref={(el) => {
                    panelsRef.current[i] = el;
                  }}
                  className={`overflow-hidden transition-all ${
                    isOpen ? "h-auto" : "h-0"
                  }`}
                >
                  <div className="pt-6 pb-4 pl-12 pr-4">
                    <p className="max-w-2xl text-base font-light text-[#6B6660] leading-relaxed mb-6">
                      {item.summary}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-center gap-2 text-xs font-mono text-[#1A1916]"
                        >
                          <span className="text-[#C9A84C]">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
