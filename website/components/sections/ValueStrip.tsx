"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ValueStrip() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".strip-line", {
        onEnter: (elements) => {
          gsap.from(elements, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          });
        },
        start: "top 88%",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-12 bg-[#F5F3F0]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <hr className="hr-editorial mb-8" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="strip-line">
            <p className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-[#C9A84C]">
              Planning & Step Graphs
            </p>
            <p className="mt-1 text-base font-light text-[#1A1916]">
              Planning, Payments, and Verification baked in.
            </p>
          </div>

          <div className="strip-line">
            <p className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-[#C9A84C]">
              Multi-Chain Settlement
            </p>
            <p className="mt-1 text-base font-light text-[#1A1916]">
              Lightning-fast, transparent, and auditable x402 payments.
            </p>
          </div>

          <div className="strip-line">
            <p className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-[#C9A84C]">
              End-to-End Replay
            </p>
            <p className="mt-1 text-base font-light text-[#1A1916]">
              Every step replays end-to-end on Algorand, Stellar & Sepolia.
            </p>
          </div>
        </div>
        <hr className="hr-editorial mt-8" />
      </div>
    </section>
  );
}
