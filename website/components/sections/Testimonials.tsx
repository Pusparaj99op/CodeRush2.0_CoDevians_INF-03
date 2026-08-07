"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Quotes } from "@phosphor-icons/react";

const TESTIMONIALS = [
  {
    quote:
      "Veldar split my translation pipeline into three priced steps. I saw every quote before a single ALGO moved. Completely trustworthy.",
    author: "Arjun M.",
    role: "Research Engineer",
    org: "YCCE Lab",
  },
  {
    quote:
      "I gave it a research goal and a 4 ALGO budget. It negotiated across three providers and came back under cap with instant receipts.",
    author: "Priya S.",
    role: "Indie Developer",
    org: "Mumbai",
  },
  {
    quote:
      "The replay feature is what sold it. Every payment on TestNet, inspectable line by line. That's the exact audit trail I needed.",
    author: "Carlos R.",
    role: "DAO Operator",
    org: "Lisbon",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  function goToSlide(newIndex: number) {
    if (newIndex < 0 || newIndex >= TESTIMONIALS.length || !slideRef.current) return;

    gsap.to(slideRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setCurrentIndex(newIndex);
        gsap.fromTo(
          slideRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        );
      },
    });
  }

  const current = TESTIMONIALS[currentIndex]!;

  return (
    <section className="py-24 lg:py-32 border-b border-[#D8D4CE] bg-[#EDEAE5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="eyebrow">● AGENTIC VERIFICATION</div>
          <div className="font-mono text-xs text-[#1A1916]">
            {currentIndex + 1} — {TESTIMONIALS.length}
          </div>
        </div>

        <div className="max-w-4xl">
          <Quotes size={48} className="text-[#C9A84C] mb-6 opacity-60" />

          <div ref={slideRef} className="min-h-[180px]">
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,3rem)] font-light italic leading-relaxed text-[#1A1916] mb-8">
              &ldquo;{current.quote}&rdquo;
            </p>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1A1916] font-mono text-sm font-bold text-[#F5F3F0]">
                {current.author.charAt(0)}
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-[#1A1916]">
                  {current.author}
                </p>
                <p className="text-xs text-[#6B6660]">
                  {current.role} / {current.org}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 mt-12">
            <button
              onClick={() => goToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="grid h-12 w-12 place-items-center rounded-full border border-[#D8D4CE] text-[#1A1916] transition-colors hover:border-[#1A1916] hover:bg-[#F5F3F0] disabled:opacity-30"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => goToSlide(currentIndex + 1)}
              disabled={currentIndex === TESTIMONIALS.length - 1}
              className="grid h-12 w-12 place-items-center rounded-full border border-[#D8D4CE] text-[#1A1916] transition-colors hover:border-[#1A1916] hover:bg-[#F5F3F0] disabled:opacity-30"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
